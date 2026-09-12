import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "태그",
  description: "태그별로 글을 모아 봅니다.",
  alternates: { canonical: "/tags" },
};

function TagCloud({
  tags,
  small = false,
}: {
  tags: { tag: string; count: number }[];
  small?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-3">
      {tags.map(({ tag, count }) => (
        <li key={tag}>
          <Link
            href={`/tags/${encodeURIComponent(tag)}`}
            className={`tag-chip ${small ? "tag-chip-sm" : "tag-chip-md"}`}
          >
            <span>#{tag}</span>
            {!small && <span className="text-foreground/40">{count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function TagsPage() {
  const tags = getAllTags();
  const common = tags.filter(({ count }) => count > 1);
  const once = tags.filter(({ count }) => count === 1);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">태그</h1>
      <p className="mt-2 text-sm text-foreground/60">
        태그 {tags.length}개 — 여러 글에 붙은 것은 {common.length}개입니다.
      </p>

      {tags.length === 0 ? (
        <p className="mt-6 text-foreground/60">아직 태그가 없습니다.</p>
      ) : (
        <>
          <div className="mt-8">
            <TagCloud tags={common} />
          </div>

          {once.length > 0 && (
            <details className="mt-10 border-t border-black/10 pt-6 dark:border-white/15">
              <summary className="cursor-pointer text-sm text-foreground/60 hover:text-foreground">
                한 편에만 붙은 태그 {once.length}개 보기
              </summary>
              <div className="mt-5">
                <TagCloud tags={once} small />
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
