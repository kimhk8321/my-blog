"use client";

import { memo, useEffect, useRef, useState } from "react";

function Tracked({ label }: { label: string }) {
  const renders = useRef(0);
  renders.current++; // 이 컴포넌트가 렌더된 횟수
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []); // SSR/하이드레이션 불일치 방지

  return (
    <div className="rounded-md bg-foreground/[0.05] px-3 py-2">
      {label} 렌더 횟수:{" "}
      <b className="font-mono text-base">{mounted ? renders.current : "–"}</b>
    </div>
  );
}

const MemoTracked = memo(Tracked);

export function RerenderCountDemo() {
  const [tick, setTick] = useState(0);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <button
        className="w-fit rounded-md border border-black/15 px-3 py-1.5 transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
        onClick={() => setTick((t) => t + 1)}
      >
        부모 리렌더 (tick {tick})
      </button>

      <Tracked label="일반 자식" />
      <MemoTracked label="React.memo 자식" />

      <p className="text-xs text-foreground/50">
        버튼을 누르면 부모가 리렌더됩니다. 일반 자식은 매번 따라 렌더되지만,
        <code>React.memo</code> 자식은 props가 그대로라 렌더되지 않습니다.
        <br />
        (개발 모드에선 StrictMode 때문에 2씩 증가할 수 있어요.)
      </p>
    </div>
  );
}
