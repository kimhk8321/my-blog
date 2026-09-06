import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, type PostMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "아카이브",
  description: "지금까지 쓴 글을 연도·월별로 모아 봅니다.",
  alternates: { canonical: "/archive" },
};

/** 최신순으로 정렬된 글을 연도 → 월로 묶는다. 순서는 그대로 유지된다. */
function groupByDate(posts: PostMeta[]) {
  const years = new Map<string, Map<string, PostMeta[]>>();

  for (const post of posts) {
    const [year, month] = post.date.split("-");
    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year)!;
    if (!months.has(month)) months.set(month, []);
    months.get(month)!.push(post);
  }

  return [...years.entries()].map(([year, months]) => ({
    year,
    count: [...months.values()].reduce((sum, list) => sum + list.length, 0),
    months: [...months.entries()].map(([month, list]) => ({ month, posts: list })),
  }));
}

export default function ArchivePage() {
  const posts = getAllPosts();
  const years = groupByDate(posts);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">아카이브</h1>
      <p className="mt-2 text-sm text-foreground/60">
        지금까지 쓴 글 {posts.length}편을 시간순으로 모았습니다.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {years.map(({ year, count, months }) => (
          <section key={year}>
            <h2 className="flex items-baseline gap-2 border-b border-black/10 pb-2 dark:border-white/10">
              <span className="text-xl font-semibold tracking-tight">{year}년</span>
              <span className="text-sm text-foreground/40">{count}편</span>
            </h2>

            <div className="mt-4 flex flex-col gap-6">
              {months.map(({ month, posts: monthPosts }) => (
                <div key={month} className="sm:flex sm:gap-6">
                  <h3 className="shrink-0 text-sm font-medium text-foreground/50 sm:w-14 sm:pt-1">
                    {Number(month)}월
                  </h3>
                  <ul className="mt-1.5 flex min-w-0 flex-1 flex-col gap-1.5 sm:mt-0">
                    {monthPosts.map((post) => (
                      <li key={post.slug} className="flex gap-3 text-sm">
                        <time
                          dateTime={post.date}
                          className="w-8 shrink-0 tabular-nums text-foreground/35"
                        >
                          {post.date.split("-")[2]}일
                        </time>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="min-w-0 break-words text-foreground/80 transition-colors hover:text-foreground hover:underline underline-offset-4"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
