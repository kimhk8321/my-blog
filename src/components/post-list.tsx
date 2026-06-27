"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";
import { TagList } from "@/components/tag-list";
import { getCategoryById } from "@/lib/categories";
import { sortPosts, SORT_OPTIONS, type SortMode } from "@/lib/post-sort";

export function PostList({ posts }: { posts: PostMeta[] }) {
  const [sort, setSort] = useState<SortMode>("latest");
  const sorted = sortPosts(posts, sort);

  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-2 text-sm">
        <label htmlFor="post-sort" className="text-foreground/50">
          정렬
        </label>
        <select
          id="post-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded-md border border-black/10 bg-background px-2 py-1 text-foreground/80 transition-colors hover:border-foreground/30 dark:border-white/15"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="flex flex-col gap-8">
        {sorted.map((post) => {
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
                  <h3 className="mt-1 text-xl font-semibold tracking-tight group-hover:underline underline-offset-4">
                    {post.title}
                    {post.draft && (
                      <span className="ml-2 align-middle rounded bg-yellow-500/15 px-2 py-0.5 text-xs font-normal text-yellow-600 dark:text-yellow-400">
                        초안
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-foreground/70">{post.description}</p>
                </Link>
                <div className="mt-3">
                  <TagList tags={post.tags ?? []} />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
