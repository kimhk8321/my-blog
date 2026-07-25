"use client";

import { useEffect, useRef, useState } from "react";

type Signal<T> = {
  get: () => T;
  set: (v: T) => void;
  subscribe: (fn: (v: T) => void) => () => void;
};

function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const subs = new Set<(v: T) => void>();
  return {
    get: () => value,
    set: (v) => {
      value = v;
      subs.forEach((fn) => fn(value));
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

const btn =
  "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function SignalCounterDemo() {
  const sigRef = useRef<Signal<number> | null>(null);
  if (!sigRef.current) sigRef.current = createSignal(0);
  const textRef = useRef<HTMLElement | null>(null);

  const renders = useRef(0);
  renders.current++;
  const [mounted, setMounted] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    setMounted(true);
    const sig = sigRef.current!;
    if (textRef.current) textRef.current.textContent = String(sig.get());
    return sig.subscribe((v) => {
      if (textRef.current) textRef.current.textContent = String(v);
    });
  }, []);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="rounded-md bg-foreground/[0.05] px-3 py-2">
        Signal 값: <b ref={textRef} className="font-mono text-base">0</b>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={btn}
          onClick={() => sigRef.current!.set(sigRef.current!.get() + 1)}
        >
          Signal +1 <span className="text-green-600 dark:text-green-400">(리렌더 X)</span>
        </button>
        <button className={btn} onClick={() => force((n) => n + 1)}>
          React setState <span className="text-red-500">(리렌더 O)</span>
        </button>
      </div>

      <div className="text-xs text-foreground/60">
        이 컴포넌트 렌더 횟수:{" "}
        <b className="font-mono">{mounted ? renders.current : "–"}</b>
      </div>

      <p className="text-xs text-foreground/50">
        <b>Signal +1</b>은 값이 바뀌어도 렌더 횟수가 그대로입니다 — 구독한 DOM
        노드만 직접 갱신하니까요. <b>setState</b>는 컴포넌트를 통째로 리렌더합니다.
      </p>
    </div>
  );
}
