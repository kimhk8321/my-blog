import Link from "next/link";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/**
 * 좁은 화면에서는 아이콘만, 넓은 화면에서는 검색창 모양으로 보여준다.
 * 실제 입력은 /search 페이지에서 받으므로 여기선 링크로 충분하다.
 */
export function SearchBox() {
  return (
    <>
      <Link
        href="/search"
        aria-label="검색"
        className="grid size-8 place-items-center rounded-md border border-black/10 text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground md:hidden dark:border-white/15 dark:hover:bg-white/10"
      >
        <SearchIcon className="size-4" />
      </Link>

      <Link
        href="/search"
        className="hidden items-center gap-2 rounded-md border border-black/10 px-3 py-1.5 text-sm text-foreground/50 transition-colors hover:border-foreground/30 hover:text-foreground/80 md:flex dark:border-white/15"
      >
        <SearchIcon className="size-4" />
        <span>검색</span>
      </Link>
    </>
  );
}
