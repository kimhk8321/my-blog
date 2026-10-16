import Link from "next/link";
type NavItem = { slug: string; title: string };

export function PostNav({
  older,
  newer,
  basePath = "/posts",
  prefetch,
}: {
  older: NavItem | null;
  newer: NavItem | null;
  basePath?: string;
  prefetch?: boolean;
}) {
  if (!older && !newer) return null;

  return (
    <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-black/10 pt-8 dark:border-white/10">
      {older ? (
        <Link
          href={`${basePath}/${older.slug}`}
          prefetch={prefetch}
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
          href={`${basePath}/${newer.slug}`}
          prefetch={prefetch}
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
