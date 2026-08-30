import { NextResponse } from "next/server";
import { RANK_KEY, redis } from "@/lib/redis";
import { getAllPosts, getAllPostSlugs } from "@/lib/posts";

const LIMIT = 5;

/** Sorted Set에서 상위 글을 꺼낸다. withScores는 [멤버, 점수, 멤버, 점수…]로 온다. */
async function readRanking(): Promise<{ slug: string; views: number }[]> {
  const flat = await redis!.zrange<(string | number)[]>(RANK_KEY, 0, LIMIT - 1, {
    rev: true,
    withScores: true,
  });

  const rows: { slug: string; views: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    rows.push({ slug: String(flat[i]), views: Number(flat[i + 1]) });
  }
  return rows;
}

/**
 * 랭킹은 이번에 새로 도입한 것이라, 이미 쌓여 있던 글별 카운터로 한 번 채워 준다.
 * 한 번 채우고 나면 이후로는 조회할 때마다 ZINCRBY가 갱신한다.
 */
async function seedRanking(): Promise<{ slug: string; views: number }[]> {
  const slugs = getAllPostSlugs();
  const counts = await redis!.mget<(number | null)[]>(
    ...slugs.map((slug) => `views:${slug}`),
  );

  const scored = slugs
    .map((slug, i) => ({ slug, views: counts[i] ?? 0 }))
    .filter((row) => row.views > 0);

  if (scored.length === 0) return [];

  // zadd는 첫 항목을 따로 받는다(최소 하나는 있어야 하므로).
  const [first, ...rest] = scored.map((row) => ({
    score: row.views,
    member: row.slug,
  }));
  await redis!.zadd(RANK_KEY, first, ...rest);

  return scored.sort((a, b) => b.views - a.views).slice(0, LIMIT);
}

export async function GET() {
  if (!redis) return NextResponse.json({ posts: [] });

  try {
    let ranking = await readRanking();
    if (ranking.length === 0) ranking = await seedRanking();

    // 슬러그를 글 정보로 바꾼다. 지워진 글은 자연스럽게 빠진다.
    const byslug = new Map(getAllPosts().map((post) => [post.slug, post]));
    const posts = ranking
      .map(({ slug, views }) => {
        const post = byslug.get(slug);
        return post ? { slug, title: post.title, views } : null;
      })
      .filter((row): row is { slug: string; title: string; views: number } =>
        row !== null,
      );

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] }); // 저장소에 문제가 있어도 페이지는 살아 있게
  }
}
