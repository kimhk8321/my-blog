"use client";

import { ELLIPSIS, pageWindow } from "@/lib/paginate";

const buttonBase =
  "min-w-9 rounded-md border px-3 py-1.5 text-sm transition-colors";
const inactive =
  "border-black/10 text-foreground/70 hover:border-foreground/30 hover:text-foreground dark:border-white/15";
const active = "border-foreground/40 font-semibold text-foreground";
const disabled = "border-black/5 text-foreground/30 dark:border-white/10";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지 이동" className="mt-12">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            className={`${buttonBase} ${page === 1 ? disabled : inactive}`}
          >
            이전
          </button>
        </li>

        {pageWindow(page, totalPages).map((item, i) =>
          item === ELLIPSIS ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className="px-1 text-sm text-foreground/40"
            >
              {ELLIPSIS}
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`${item}페이지`}
                className={`${buttonBase} ${item === page ? active : inactive}`}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
            className={`${buttonBase} ${page === totalPages ? disabled : inactive}`}
          >
            다음
          </button>
        </li>
      </ul>
    </nav>
  );
}
