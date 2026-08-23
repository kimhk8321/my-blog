import { bm25Tf, getIndex, idf, type SearchIndex } from "@/lib/search-index";
import type { PostMeta } from "@/lib/posts";

/**
 * 관련 글 추천.
 *
 * 검색이 "질문(검색어)과 글을 맞춰보는 것"이라면, 추천은 "글과 글을 맞춰보는 것"이다.
 * 같은 역색인을 재활용해 글마다 특징 벡터를 만들고, 코사인 유사도로 가까운 글을 찾는다.
 */

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  tags: string[];
  score: number;
}

/** 글 한 편을 대표하는 토큰 수. 비중이 큰 것만 남겨 계산도 줄이고 잡음도 줄인다. */
const VECTOR_SIZE = 150;

/**
 * 관련이라고 하려면 여러 갈래로 겹쳐야 한다.
 * Docker 글과 "CSS 컨테이너 쿼리" 글은 '컨테이너'라는 한 단어만 겹치는데,
 * 그 단어를 서로 많이 반복하는 바람에 유사도가 높게 나온다.
 * 그래서 겹치는 토큰의 가짓수가 적으면 점수를 깎는다.
 */
const ENOUGH_OVERLAP = 12;

/**
 * 1위와 너무 차이 나는 글은 아예 빼는 게 낫다.
 * 억지로 3편을 채우면 관련 없는 글이 섞여 추천 전체가 못 미덥게 보인다.
 */
const RELATIVE_FLOOR = 0.25;


interface DocVector {
  weights: Map<string, number>;
  /** 벡터의 크기 — 코사인 유사도에서 길이 영향을 지우는 데 쓴다. */
  norm: number;
}

/** 한글 한 글자는 "컴포넌트"의 '트'처럼 아무 데나 걸려 유사도를 흐린다. */
function isNoise(token: string): boolean {
  return token.length === 1 && token.charCodeAt(0) >= 0xac00;
}

function buildVectors(index: SearchIndex): DocVector[] {
  const { docs, postings, avgLength } = index;
  const raw: Map<string, number>[] = docs.map(() => new Map());

  // 역색인을 한 번 훑으며 글별 TF-IDF 가중치를 모은다.
  for (const [token, byDoc] of postings) {
    if (isNoise(token)) continue;

    const weight = idf(byDoc.size, docs.length);
    for (const [docId, posting] of byDoc) {
      const score =
        weight *
        (posting.topical +
          posting.support +
          bm25Tf(posting.tf, docs[docId].length, avgLength));
      if (score > 0) raw[docId].set(token, score);
    }
  }

  return raw.map((weights) => {
    const top = [...weights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, VECTOR_SIZE);

    let sumOfSquares = 0;
    for (const [, w] of top) sumOfSquares += w * w;

    return { weights: new Map(top), norm: Math.sqrt(sumOfSquares) || 1 };
  });
}

// 색인과 마찬가지로 배포 시점에 고정되므로 한 번만 만든다.
let cachedVectors: DocVector[] | null = null;

function getVectors(index: SearchIndex): DocVector[] {
  if (process.env.NODE_ENV !== "production") return buildVectors(index);
  return (cachedVectors ??= buildVectors(index));
}

/**
 * 본문이 닮았다는 것만으로는 부족하다. Docker 글과 "CSS 컨테이너 쿼리" 글은
 * '컨테이너'라는 말만 겹칠 뿐 아무 상관이 없다.
 * 그래서 사람이 직접 붙여 둔 분류(카테고리·태그)를 신호로 더한다.
 */
function editorialBoost(a: PostMeta, b: PostMeta): number {
  let boost = 1;
  if (a.category && a.category === b.category) boost *= 1.25;

  const shared = (a.tags ?? []).filter((t) => (b.tags ?? []).includes(t)).length;
  if (shared > 0) boost *= 1 + Math.min(shared, 3) * 0.12;

  return boost;
}

export function getRelatedPosts(slug: string, limit = 3): RelatedPost[] {
  const index = getIndex();
  const targetId = index.docs.findIndex((d) => d.post.slug === slug);
  if (targetId === -1) return [];

  const vectors = getVectors(index);
  const target = vectors[targetId];
  const scored: { docId: number; similarity: number }[] = [];

  for (let docId = 0; docId < vectors.length; docId++) {
    if (docId === targetId) continue;

    const other = vectors[docId];
    let dot = 0;
    let overlap = 0;
    for (const [token, weight] of target.weights) {
      const otherWeight = other.weights.get(token);
      if (otherWeight) {
        dot += weight * otherWeight;
        overlap++;
      }
    }
    if (dot <= 0) continue;

    // 코사인 유사도 — 벡터 크기로 나눠서 "글이 길어서 겹치는 것"을 걸러낸다.
    const similarity =
      (dot / (target.norm * other.norm)) *
      Math.min(1, overlap / ENOUGH_OVERLAP);
    scored.push({
      docId,
      similarity:
        similarity *
        editorialBoost(index.docs[targetId].post, index.docs[docId].post),
    });
  }

  scored.sort((a, b) => b.similarity - a.similarity || a.docId - b.docId);

  const best = scored[0]?.similarity ?? 0;
  const good = scored.filter((s) => s.similarity >= best * RELATIVE_FLOOR);

  return good
    .slice(0, limit).map(({ docId, similarity }) => {
    const { post } = index.docs[docId];
    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      category: post.category,
      tags: post.tags ?? [],
      score: Math.round(similarity * 1000) / 1000,
    };
  });
}
