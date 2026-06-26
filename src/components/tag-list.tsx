import Link from "next/link";

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${encodeURIComponent(tag)}`}
            className="block rounded-full border border-black/10 px-3 py-0.5 text-xs text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground dark:border-white/15"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
