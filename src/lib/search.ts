import type { Post } from "@/lib/posts";
import {
  bm25Tf,
  getIndex,
  idf,
  tokenize,
} from "@/lib/search-index";

/** 검색어를 받아 관련도 순으로 글을 돌려준다. */
export interface SearchHit {
  slug: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  tags: string[];
  score: number;
  snippet: string;
}

/**
 * 검색어가 통째로 들어있으면 확실한 신호다.
 * "서버 캐싱"으로 찾을 때 그 말이 제목에 그대로 있는 글을 위로 올린다.
 */
function phraseBoost(post: Post, phrase: string): number {
  if (phrase.length < 2) return 1;
  if (post.title.toLowerCase().includes(phrase)) return 1.6;
  if ((post.tags ?? []).some((t) => t.toLowerCase().includes(phrase))) return 1.35;
  if (post.description.toLowerCase().includes(phrase)) return 1.2;
  return 1;
}

function makeSnippet(plain: string, query: string, tokens: string[]): string {
  const lower = plain.toLowerCase();
  const q = query.toLowerCase().trim();

  let at = q ? lower.indexOf(q) : -1;
  if (at === -1) {
    // 검색어 전체가 그대로 없으면, 가장 긴 토큰이 나온 위치를 쓴다.
    for (const token of [...tokens].sort((a, b) => b.length - a.length)) {
      at = lower.indexOf(token);
      if (at !== -1) break;
    }
  }
  if (at === -1) return plain.slice(0, 140).trim();

  const start = Math.max(0, at - 60);
  const end = Math.min(plain.length, at + 100);
  return (
    (start > 0 ? "…" : "") +
    plain.slice(start, end).trim() +
    (end < plain.length ? "…" : "")
  );
}

export function search(query: string, limit = 20): SearchHit[] {
  const { docs, postings, avgLength } = getIndex();
  const tokens = [...new Set(tokenize(query, "query"))];
  if (tokens.length === 0) return [];

  // 순위는 topicalScore(제목·태그)로 가르고, restScore(설명·본문)는 보조로만 쓴다.
  const topicalScores = new Map<number, number>();
  const restScores = new Map<number, number>();
  const hitCount = new Map<number, number>();

  for (const token of tokens) {
    const byDoc = postings.get(token);
    if (!byDoc) continue;

    const weight = idf(byDoc.size, docs.length);
    for (const [docId, posting] of byDoc) {
      topicalScores.set(
        docId,
        (topicalScores.get(docId) ?? 0) + weight * posting.topical,
      );
      restScores.set(
        docId,
        (restScores.get(docId) ?? 0) +
          weight *
            (posting.support +
              bm25Tf(posting.tf, docs[docId].length, avgLength)),
      );
      hitCount.set(docId, (hitCount.get(docId) ?? 0) + 1);
    }
  }

  if (hitCount.size === 0) return [];

  // 검색어가 통째로 들어있는 글을 끌어올린다.
  const phrase = query.trim().toLowerCase();
  for (const [docId, score] of topicalScores) {
    topicalScores.set(docId, score * phraseBoost(docs[docId].post, phrase));
  }

  const scores = new Map(
    [...hitCount.keys()].map((docId) => [
      docId,
      (topicalScores.get(docId) ?? 0) + (restScores.get(docId) ?? 0),
    ]),
  );

  // 모든 토큰이 들어있는 글만(AND). 그런 글이 없으면 일부만 맞는 글이라도 보여준다(OR).
  const all = [...scores.keys()];
  const strict = all.filter((docId) => hitCount.get(docId) === tokens.length);
  const candidates = strict.length > 0 ? strict : all;

  // 5% 이내 차이는 같은 등급으로 보고, 그 안에서는 글 목록과 같은 순서를 쓴다.
  const maxTopical = Math.max(
    ...candidates.map((id) => topicalScores.get(id) ?? 0),
  );
  const tierSize = Math.max(maxTopical * 0.05, Number.EPSILON);
  const tierOf = (docId: number) =>
    Math.round((topicalScores.get(docId) ?? 0) / tierSize);

  return candidates
    .sort((a, b) => {
      const tierA = tierOf(a);
      const tierB = tierOf(b);
      if (tierA !== tierB) return tierB - tierA;

      // 제목·태그엔 없고 설명·본문에만 있는 글끼리는 그 관련도로 가른다.
      if (tierA === 0) {
        return (restScores.get(b) ?? 0) - (restScores.get(a) ?? 0);
      }

      // docs는 글 목록과 같은 순서(최신순)로 정렬돼 있다.
      return a - b;
    })
    .slice(0, limit)
    .map((docId) => {
      const { post, plain } = docs[docId];
      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        category: post.category,
        tags: post.tags ?? [],
        score: Math.round((scores.get(docId) ?? 0) * 100) / 100,
        snippet: makeSnippet(plain, query, tokens),
      };
    });
}

