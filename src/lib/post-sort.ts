// 글 목록 정렬 로직 (순수 모듈 — 서버/클라이언트 공용)
import { categories } from "@/lib/categories";
import type { PostMeta } from "@/lib/posts"; // 타입 전용 import (런타임 의존성 없음)

export type SortMode = "latest" | "oldest" | "title";

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "title", label: "제목순" },
];

const categoryIndex = new Map(categories.map((c, i) => [c.id, i]));

function categoryRank(id?: string): number {
  const i = id ? categoryIndex.get(id) : undefined;
  return i === undefined ? categories.length : i;
}

function byTitle(a: PostMeta, b: PostMeta): number {
  return a.title.localeCompare(b.title, "ko", { numeric: true });
}

/**
 * 글 목록을 정렬해 새 배열로 반환한다.
 * - latest/oldest: 날짜순. 같은 날짜면 카테고리 순서 → 제목(숫자 인식) 순으로 묶어,
 *   한 번에 올라온 시리즈도 (1)→(2)… 순서로 보이게 한다.
 * - title: 제목(숫자 인식) 가나다순.
 */
export function sortPosts<T extends PostMeta>(
  posts: T[],
  mode: SortMode = "latest",
): T[] {
  const arr = [...posts];

  if (mode === "title") {
    return arr.sort(byTitle);
  }

  const dir = mode === "oldest" ? -1 : 1;
  return arr.sort((a, b) => {
    const byDate = dir * (+new Date(b.date) - +new Date(a.date));
    if (byDate !== 0) return byDate;
    const byCategory = categoryRank(a.category) - categoryRank(b.category);
    if (byCategory !== 0) return byCategory;
    return byTitle(a, b);
  });
}
