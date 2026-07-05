"use client";

import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function UseDebounceDemo() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  // debouncedQuery가 바뀔 때만 "API 호출"이 일어난다고 가정
  const [callCount, setCallCount] = useState(0);
  useEffect(() => {
    if (debouncedQuery === "") return;
    setCallCount((c) => c + 1);
  }, [debouncedQuery]);

  const stale = query !== debouncedQuery;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <input
        className="w-80 max-w-full rounded-md border border-black/15 px-3 py-1.5 dark:border-white/20"
        placeholder="검색어를 빠르게 입력해 보세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="text-xs text-foreground/70">
        입력값(즉시): <b className="font-mono">{query || "∅"}</b>
        <br />
        디바운스된 값(500ms): <b className="font-mono">{debouncedQuery || "∅"}</b>{" "}
        {stale && <span className="text-amber-600 dark:text-amber-400">…대기 중</span>}
      </div>
      <div className="rounded-md bg-foreground/[0.05] px-3 py-2 text-xs">
        가상 API 호출 횟수: <b className="font-mono text-base">{callCount}</b>{" "}
        <span className="text-foreground/50">
          (매 입력이 아니라 멈췄을 때만 호출)
        </span>
      </div>
    </div>
  );
}
