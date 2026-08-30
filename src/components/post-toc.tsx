"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            aria-current={activeId === item.id ? "location" : undefined}
            className={
              activeId === item.id
                ? "block break-words border-l-2 border-indigo-500 pl-3 text-foreground"
                : "block break-words border-l-2 border-transparent pl-3 text-foreground/55 transition-colors hover:text-foreground"
            }
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PostToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // 스크롤마다 위치를 재지 않도록 IntersectionObserver를 쓴다.
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // 화면 위쪽 띠에 들어온 것 중 가장 앞선 헤딩이 "지금 읽는 곳".
        const current = items.find((item) => visible.has(item.id));
        // 긴 문단을 읽는 중에는 띠에 아무것도 없다 — 그땐 직전 값을 유지한다.
        if (current) setActiveId(current.id);
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <>
      {/* 좁은 화면에서는 접어 둔다 */}
      <details
        open={open}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
        className="mb-10 rounded-lg border border-black/10 px-4 py-3 lg:hidden dark:border-white/15"
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-foreground/70 marker:content-none">
          목차 ({items.length})
        </summary>
        <nav className="mt-3">
          <TocList
            items={items}
            activeId={activeId}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </details>

      <nav
        aria-label="목차"
        className="mb-10 hidden rounded-lg border border-black/10 px-4 py-3 lg:block dark:border-white/15"
      >
        <p className="mb-2 text-sm font-semibold text-foreground/70">목차</p>
        <TocList items={items} activeId={activeId} />
      </nav>
    </>
  );
}
