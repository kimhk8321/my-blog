"use client";

import { useEffect, useRef, useState } from "react";

const PAGE = 20;
const MAX = 200;

export function InfiniteScrollDemo() {
  const [count, setCount] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingRef.current) {
        loadingRef.current = true;
        setTimeout(() => {
          setCount((c) => Math.min(c + PAGE, MAX));
          loadingRef.current = false;
        }, 400); // 로딩 흉내
      }
    });

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="text-xs text-foreground/60">
        불러온 항목: <b className="font-mono">{count}</b> / {MAX}
      </div>
      <div className="h-56 overflow-auto rounded-md border border-black/10 dark:border-white/15">
        {items.map((i) => (
          <div
            key={i}
            className="border-b border-black/5 px-3 py-2 font-mono text-xs dark:border-white/10"
          >
            항목 #{i}
          </div>
        ))}
        <div
          ref={sentinelRef}
          className="py-3 text-center text-xs text-foreground/40"
        >
          {count < MAX ? "스크롤하면 더 불러옵니다…" : "끝까지 불러왔습니다"}
        </div>
      </div>
    </div>
  );
}
