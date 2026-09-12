import Link from "next/link";

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${encodeURIComponent(tag)}`}
            className="tag-chip-xs"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
