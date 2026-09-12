"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";
import { TagList } from "@/components/tag-list";
import { getCategoryById } from "@/lib/categories";
import { sortPosts, SORT_OPTIONS, type SortMode } from "@/lib/post-sort";
import { paginate } from "@/lib/paginate";
import { Pagination } from "@/components/pagination";

/** 한 화면에 보여 줄 글 수. */
const PER_PAGE = 20;

export function PostList({ posts }: { posts: PostMeta[] }) {
  const [sort, setSort] = useState<SortMode>("latest");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => sortPosts(posts, sort), [posts, sort]);
  const { items, page: current, totalPages, total } = paginate(sorted, page, PER_PAGE);

  function goTo(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div>
      <div ref={topRef} className="mb-6 flex items-center justify-between gap-2 text-sm">
        <p className="text-foreground/50">
          {total}편
          {totalPages > 1 && (
            <span className="ml-2 text-foreground/40">
              ({current}/{totalPages} 쪽)
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="post-sort" className="text-foreground/50">
            정렬
          </label>
          <select
            id="post-sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortMode);
              setPage(1);
            }}
            className="rounded-md border border-black/10 bg-background px-2 py-1 text-foreground/80 transition-colors hover:border-foreground/30 dark:border-white/15"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="flex flex-col gap-8">
        {items.map((post) => {
          const category = post.category
            ? getCategoryById(post.category)
            : undefined;
          return (
            <li key={post.slug}>
              <article>
                <Link href={`/posts/${post.slug}`} className="group block">
                  <div className="flex items-center gap-2 text-sm text-foreground/50">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {category && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{category.label}</span>
                      </>
                    )}
                    {post.migrated && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                        이관 기록
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight break-words group-hover:underline underline-offset-4">
                    {post.title}
                    {post.draft && (
                      <span className="ml-2 align-middle rounded bg-yellow-500/15 px-2 py-0.5 text-xs font-normal text-yellow-600 dark:text-yellow-400">
                        초안
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 break-words text-foreground/70">{post.description}</p>
                </Link>
                <div className="mt-3">
                  <TagList tags={post.tags ?? []} />
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <Pagination page={current} totalPages={totalPages} onChange={goTo} />
    </div>
  );
}
