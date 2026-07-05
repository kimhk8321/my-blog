"use client";

import { memo, useDeferredValue, useMemo, useState } from "react";

const ALL = Array.from({ length: 5000 }, (_, i) => `항목 #${i}`);

// 일부러 무거운 리스트 — query가 바뀔 때만 렌더되도록 memo
const HeavyList = memo(function HeavyList({ query }: { query: string }) {
  const items = useMemo(
    () => ALL.filter((x) => x.includes(query)).slice(0, 800),
    [query],
  );
  return (
    <div className="h-40 overflow-auto rounded-md border border-black/10 dark:border-white/15">
      {items.map((x) => (
        <div key={x} className="border-b border-black/5 px-3 py-1 font-mono text-xs dark:border-white/10">
          {x}
        </div>
      ))}
    </div>
  );
});

export function ConcurrentSearchDemo() {
  const [query, setQuery] = useState("");
  const [useDefer, setUseDefer] = useState(true);
  const deferred = useDeferredValue(query);

  const listQuery = useDefer ? deferred : query;
  const stale = useDefer && query !== deferred;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="w-80 max-w-full rounded-md border border-black/15 px-3 py-1.5 dark:border-white/20"
          placeholder="숫자를 빠르게 입력해 보세요 (예: 123)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          <input
            type="checkbox"
            checked={useDefer}
            onChange={(e) => setUseDefer(e.target.checked)}
          />
          useDeferredValue 사용
        </label>
      </div>

      <div className="text-xs text-foreground/60">
        입력(즉시): <b className="font-mono">{query || "∅"}</b> · 목록 기준:{" "}
        <b className="font-mono">{listQuery || "∅"}</b>{" "}
        {stale && <span className="text-amber-600 dark:text-amber-400">…목록 갱신 중</span>}
      </div>

      <HeavyList query={listQuery} />

      <p className="text-xs text-foreground/50">
        체크를 끄면(입력값 직접 사용) 빠르게 타이핑할 때 입력이 버벅일 수
        있습니다. 켜면 입력은 즉시 반영되고 무거운 목록만 뒤늦게 따라옵니다.
      </p>
    </div>
  );
}
