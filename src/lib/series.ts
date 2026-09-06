import { getAllPosts, type PostMeta } from "@/lib/posts";

export interface SeriesEntry {
  slug: string;
  title: string;
  seriesOrder: number;
  current: boolean;
}

export interface SeriesInfo {
  name: string;
  /** 시리즈 안에서 몇 번째 글인지(1부터) */
  position: number;
  total: number;
  entries: SeriesEntry[];
}

/** 시리즈 제목에서 "(3) — " 같은 번호 표기를 덜어내 목록을 읽기 쉽게 만든다. */
function shortTitle(title: string, name: string): string {
  return title
    .replace(name, "")
    .replace(/^\s*\(\d+\)\s*[—–-]?\s*/, "")
    .trim() || title;
}

export function getSeries(slug: string): SeriesInfo | null {
  const posts = getAllPosts();
  const current = posts.find((post) => post.slug === slug);
  if (!current?.series) return null;

  const members: PostMeta[] = posts
    .filter((post) => post.series === current.series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));

  if (members.length < 2) return null;

  const entries = members.map((post) => ({
    slug: post.slug,
    title: shortTitle(post.title, current.series!),
    seriesOrder: post.seriesOrder ?? 0,
    current: post.slug === slug,
  }));

  return {
    name: current.series,
    position: entries.findIndex((entry) => entry.current) + 1,
    total: entries.length,
    entries,
  };
}
