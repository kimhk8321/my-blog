import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function PostNav({
  older,
  newer,
}: {
  older: PostMeta | null;
  newer: PostMeta | null;
}) {
  if (!older && !newer) return null;

  return (
    <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-black/10 pt-8 dark:border-white/10">
      {older ? (
        <Link
          href={`/posts/${older.slug}`}
          className="group flex flex-col gap-1 rounded-lg border border-black/10 p-4 transition-colors hover:border-foreground/30 dark:border-white/15"
        >
          <span className="text-xs text-foreground/50">← 이전 글</span>
          <span className="font-medium group-hover:underline underline-offset-4">
            {older.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {newer ? (
        <Link
          href={`/posts/${newer.slug}`}
          className="group flex flex-col items-end gap-1 rounded-lg border border-black/10 p-4 text-right transition-colors hover:border-foreground/30 dark:border-white/15"
        >
          <span className="text-xs text-foreground/50">다음 글 →</span>
          <span className="font-medium group-hover:underline underline-offset-4">
            {newer.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
