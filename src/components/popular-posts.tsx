"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PopularPost {
  slug: string;
  title: string;
  views: number;
}

/** 저장소가 없거나 집계가 없으면 아무것도 그리지 않는다. */
export function PopularPosts() {
  const [posts, setPosts] = useState<PopularPost[]>([]);

  useEffect(() => {
    fetch("/api/popular")
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mb-12 rounded-lg border border-black/10 px-4 py-3 dark:border-white/15">
      <h2 className="text-sm font-semibold text-foreground/70">많이 읽은 글</h2>
      <ol className="mt-2 flex flex-col gap-1.5">
        {posts.map((post, i) => (
          <li key={post.slug} className="flex items-baseline gap-2 text-sm">
            <span className="w-4 shrink-0 text-foreground/35 tabular-nums">
              {i + 1}
            </span>
            <Link
              href={`/posts/${post.slug}`}
              className="min-w-0 flex-1 break-words text-foreground/80 transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              {post.title}
            </Link>
            <span className="shrink-0 text-xs text-foreground/35 tabular-nums">
              {post.views.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
