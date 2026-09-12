import { getAllPostsWithContent, type Post } from "@/lib/posts";

/**
 * 검색·추천이 함께 쓰는 역색인.
 *
 * 글 전체를 매번 처음부터 훑으면(풀 스캔) 글이 늘수록 느려진다.
 * 그래서 "토큰 → 그 토큰이 들어있는 글 목록"을 미리 만들어 두고,
 * 필요할 때 해당 토큰만 바로 찾아간다. DB 인덱스와 같은 발상.
 */
/** 필드별 가중치 — 제목에 있는 말이 본문에 있는 말보다 중요하다. */
const FIELD_WEIGHT = { title: 12, tags: 8, description: 4 } as const;

/** 한글은 음절, 영문·숫자는 단어 단위로 끊는다. */
const RUN_RE = /[가-힣]+|[a-z0-9]+/g;

/**
 * 색인용 토큰과 검색용 토큰은 다르게 만든다(실제 검색엔진도 그렇다).
 *
 * - 한글: 공백으로 단어가 안 갈린다("이벤트루프를"). n-gram으로 쪼갠다.
 *   색인할 땐 한 글자(유니그램)까지 넣어 "훅" 같은 한 글자 검색도 되게 하지만,
 *   검색할 땐 두 글자 이상이면 유니그램을 뺀다. "리액트"의 '트'가
 *   "컴포넌트"에도 걸려서 엉뚱한 글이 올라오기 때문이다.
 * - 영문: 색인할 땐 접두사까지 넣어 "reac"로도 "react"가 잡히게 한다(edge n-gram).
 *   검색할 땐 입력한 그대로만 쓴다.
 */
export function tokenize(text: string, mode: "index" | "query"): string[] {
  const out: string[] = [];
  for (const [run] of text.toLowerCase().matchAll(RUN_RE)) {
    if (run.charCodeAt(0) >= 0xac00) {
      if (run.length === 1) {
        out.push(run);
        continue;
      }
      for (let i = 0; i < run.length; i++) {
        if (mode === "index") out.push(run[i]);
        if (i + 1 < run.length) out.push(run.slice(i, i + 2));
      }
    } else {
      out.push(run);
      if (mode === "index") {
        for (let len = 2; len < run.length; len++) out.push(run.slice(0, len));
      }
    }
  }
  return out;
}

/** MDX에서 검색에 쓸 순수 텍스트만 남긴다(코드 블록·태그·마크다운 기호 제거). */
function toPlainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[#>\-*|:\s]+/gm, " ")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 한 글에서 특정 토큰이 얼마나·어디에 나왔는지. */
export interface Posting {
  /** 제목·태그 가중치 합 — "이 글이 그 주제인가"를 가르는 신호 */
  topical: number;
  /** 설명 가중치 — 참고용 보조 신호 */
  support: number;
  /** 본문 등장 횟수 */
  tf: number;
}

type Field = "topical" | "support" | "content";

export interface SearchIndex {
  docs: { post: Post; plain: string; length: number }[];
  /** 토큰 → (글 번호 → 등장 정보) */
  postings: Map<string, Map<number, Posting>>;
  /** 본문 평균 길이 — 긴 글을 보정하는 기준 */
  avgLength: number;
}

function addToken(
  postings: SearchIndex["postings"],
  token: string,
  docId: number,
  field: Field,
  weight: number,
) {
  let byDoc = postings.get(token);
  if (!byDoc) postings.set(token, (byDoc = new Map()));

  const posting = byDoc.get(docId) ?? { topical: 0, support: 0, tf: 0 };
  if (field === "content") posting.tf += 1;
  else posting[field] += weight;
  byDoc.set(docId, posting);
}

function buildIndex(): SearchIndex {
  const posts = getAllPostsWithContent();
  const postings: SearchIndex["postings"] = new Map();
  const docs = posts.map((post) => ({
    post,
    plain: toPlainText(post.content),
    length: 0,
  }));

  docs.forEach(({ post, plain }, docId) => {
    const fields: [string, Field, number][] = [
      [post.title, "topical", FIELD_WEIGHT.title],
      [(post.tags ?? []).join(" "), "topical", FIELD_WEIGHT.tags],
      [post.description, "support", FIELD_WEIGHT.description],
    ];

    for (const [text, field, weight] of fields) {
      // 같은 필드 안에서 중복 토큰은 한 번만 가중치를 준다.
      for (const token of new Set(tokenize(text, "index"))) {
        addToken(postings, token, docId, field, weight);
      }
    }

    const contentTokens = tokenize(plain, "index");
    docs[docId].length = contentTokens.length;
    for (const token of contentTokens) {
      addToken(postings, token, docId, "content", 1);
    }
  });

  const avgLength =
    docs.reduce((sum, d) => sum + d.length, 0) / Math.max(1, docs.length);

  return { docs, postings, avgLength };
}

// 글은 배포 시점에 고정된 파일이라, 색인을 한 번만 만들어 재사용한다(메모이제이션).
// 개발 중에는 글을 고칠 때마다 반영되도록 매번 다시 만든다.
let cachedIndex: SearchIndex | null = null;

export function getIndex(): SearchIndex {
  if (process.env.NODE_ENV !== "production") return buildIndex();
  return (cachedIndex ??= buildIndex());
}

/**
 * 흔한 토큰일수록 변별력이 없다(조사 "의", "이"는 거의 모든 글에 있음).
 * 등장하는 글이 적을수록 점수를 높게 준다 — 불용어 목록 없이 같은 효과.
 */
export function idf(docFreq: number, total: number): number {
  return Math.log(1 + total / docFreq);
}

/** BM25 상수 — k1은 반복이 포화되는 속도, b는 길이 보정의 세기. */
const K1 = 1.2;
const B = 0.75;

/**
 * 본문 등장 횟수를 점수로 바꾼다(BM25).
 *
 * 그냥 횟수를 더하면 "많이 반복한 글"이 이긴다. 예를 들어 React Native 글은
 * "React Native"를 반복하느라 react가 22번 나오는데, 정작 React 자체를 다루는
 * 글보다 위로 올라가버린다. 그래서
 *   - 반복은 금방 포화시키고(k1) — 5번이든 20번이든 큰 차이가 없게
 *   - 긴 글은 그만큼 할인한다(b) — 길어서 많이 나온 것과 구분
 */
export function bm25Tf(tf: number, docLength: number, avgLength: number): number {
  if (tf <= 0) return 0;
  const norm = 1 - B + B * (docLength / (avgLength || 1));
  return (tf * (K1 + 1)) / (tf + K1 * norm);
}
