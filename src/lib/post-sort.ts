import { categories } from "@/lib/categories";
import type { PostMeta } from "@/lib/posts";

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
    // 최신순은 (10), 오래된순은 (1)이 위로
    return -dir * byTitle(a, b);
  });
}
