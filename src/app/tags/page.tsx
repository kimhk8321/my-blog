import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "태그",
  description: "태그별로 글을 모아 봅니다.",
  alternates: { canonical: "/tags" },
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">태그</h1>

      {tags.length === 0 ? (
        <p className="mt-6 text-foreground/60">아직 태그가 없습니다.</p>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-sm text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground dark:border-white/15"
              >
                <span>#{tag}</span>
                <span className="text-foreground/40">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
