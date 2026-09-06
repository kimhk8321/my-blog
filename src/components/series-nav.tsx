import Link from "next/link";
import { getSeries } from "@/lib/series";

export function SeriesNav({ slug }: { slug: string }) {
  const series = getSeries(slug);
  if (!series) return null;

  return (
    <nav
      aria-label="시리즈 목차"
      className="mb-10 rounded-lg border border-indigo-500/25 bg-indigo-500/5 px-4 py-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground/80">
          시리즈 · {series.name}
        </p>
        <p className="text-xs text-foreground/50 tabular-nums">
          {series.position} / {series.total}편
        </p>
      </div>

      <ol className="mt-2.5 flex flex-col gap-1 text-sm">
        {series.entries.map((entry) => (
          <li key={entry.slug} className="flex gap-2">
            <span
              className={
                entry.current
                  ? "w-5 shrink-0 text-right tabular-nums text-foreground/70"
                  : "w-5 shrink-0 text-right tabular-nums text-foreground/35"
              }
            >
              {entry.seriesOrder}
            </span>
            {entry.current ? (
              <span
                aria-current="page"
                className="min-w-0 break-words font-medium text-foreground"
              >
                {entry.title}
              </span>
            ) : (
              <Link
                href={`/posts/${entry.slug}`}
                className="min-w-0 break-words text-foreground/60 transition-colors hover:text-foreground hover:underline underline-offset-4"
              >
                {entry.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
