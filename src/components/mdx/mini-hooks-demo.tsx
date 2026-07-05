"use client";

import { useReducer, useRef } from "react";

type SetState<T> = (v: T | ((prev: T) => T)) => void;

// 글에서 설명하는 "미니 훅 엔진" — slots 배열 + cursor로 훅 상태를 기억한다.
function createHookEngine(rerender: () => void) {
  const slots: unknown[] = [];
  let cursor = 0;

  function useState<T>(initial: T): [T, SetState<T>] {
    const i = cursor++;
    if (i >= slots.length) slots[i] = initial;

    const setState: SetState<T> = (v) => {
      slots[i] = typeof v === "function" ? (v as (p: T) => T)(slots[i] as T) : v;
      rerender(); // React를 다시 그리게 해서 컴포넌트 함수를 재실행
    };

    return [slots[i] as T, setState];
  }

  return { useState, reset: () => (cursor = 0), slots };
}

export function MiniHooksDemo() {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const engineRef = useRef<ReturnType<typeof createHookEngine> | null>(null);
  if (!engineRef.current) engineRef.current = createHookEngine(forceRender);
  const engine = engineRef.current;

  // ── 여기서부터는 "우리가 만든 useState"만 사용한다 ──
  engine.reset(); // 렌더 시작 시 cursor를 0으로
  const [count, setCount] = engine.useState(0);
  const [text, setText] = engine.useState("리액트");

  const btn =
    "rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-3">
        <button className={btn} onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
        <button className={btn} onClick={() => setCount(0)}>
          reset
        </button>
        <span>
          count = <b className="font-mono">{count}</b>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          className="rounded-md border border-black/15 px-2 py-1 dark:border-white/20"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span>
          text = <b className="font-mono">&quot;{text}&quot;</b>
        </span>
      </div>

      <div className="rounded-md bg-foreground/[0.05] p-3 font-mono text-xs text-foreground/70">
        내부 slots 배열 → [{engine.slots.map((s) => JSON.stringify(s)).join(", ")}]
      </div>
    </div>
  );
}
