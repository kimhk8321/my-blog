"use client";

import { useRef, useState } from "react";

// 실제 fetch 대신, 쿼리별로 '가변 지연' 응답을 흉내 낸다.
export function AbortRaceDemo() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("—");
  const [log, setLog] = useState<string[]>([]);
  const [useAbort, setUseAbort] = useState(true);
  const tokenRef = useRef<{ aborted: boolean } | null>(null);

  const search = (q: string) => {
    setQuery(q);
    if (!q) {
      setResult("—");
      return;
    }
    // 이전 요청 취소 (AbortController.abort() 역할)
    if (useAbort && tokenRef.current) tokenRef.current.aborted = true;
    const token = { aborted: false };
    tokenRef.current = token;

    const delay = Math.round(200 + Math.random() * 1400); // 응답 시간 들쭉날쭉
    setTimeout(() => {
      if (token.aborted) return; // 취소된 요청은 결과 무시
      setResult(`"${q}"`);
      setLog((l) => [`✓ "${q}" 응답(${delay}ms) → 화면 반영`, ...l].slice(0, 5));
    }, delay);
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="빠르게 타이핑해 보세요…"
        className="w-full max-w-xs rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
      />

      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={useAbort}
          onChange={(e) => setUseAbort(e.target.checked)}
        />
        이전 요청 취소(AbortController) 사용
      </label>

      <div>
        화면에 반영된 결과:{" "}
        <b className="font-mono">{result}</b>
        <span className="ml-2 text-xs text-foreground/50">
          (입력값과 다르면 <b className="text-red-500">경쟁 상태</b>)
        </span>
      </div>

      <div className="rounded-md bg-foreground/[0.05] p-2 font-mono text-[11px] text-foreground/60">
        {log.length ? log.map((l, i) => <div key={i}>{l}</div>) : "로그…"}
      </div>

      <p className="text-xs text-foreground/50">
        취소를 <b>끄고</b> 빠르게 타이핑하면, 늦게 도착한 옛 요청이 최신 결과를
        덮어써 입력값과 화면이 어긋납니다. <b>켜면</b> 항상 최신 결과만 남습니다.
      </p>
    </div>
  );
}
