"use client";

import { useEffect, useRef, useState } from "react";

const DELAY = 500;

export function DebounceThrottleDemo() {
  const [raw, setRaw] = useState(0);
  const [debounced, setDebounced] = useState(0);
  const [throttled, setThrottled] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastThrottle = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const onType = () => {
    setRaw((n) => n + 1); // 매 입력마다

    // 디바운스: 멈춘 뒤 DELAY 후 1번
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebounced((n) => n + 1), DELAY);

    // 스로틀: DELAY 간격으로 최대 1번
    const now = Date.now();
    if (now - lastThrottle.current >= DELAY) {
      lastThrottle.current = now;
      setThrottled((n) => n + 1);
    }
  };

  const reset = () => {
    setRaw(0);
    setDebounced(0);
    setThrottled(0);
  };

  const cell = "rounded-md bg-foreground/[0.05] px-3 py-2 text-center";

  return (
    <div className="flex flex-col gap-3 text-sm">
      <input
        className="w-80 max-w-full rounded-md border border-black/15 px-3 py-1.5 dark:border-white/20"
        placeholder="여기에 빠르게 타이핑해 보세요"
        onChange={onType}
      />
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className={cell}>
          raw
          <div className="mt-1 font-mono text-lg">{raw}</div>
          <div className="text-foreground/50">매 입력</div>
        </div>
        <div className={cell}>
          debounce
          <div className="mt-1 font-mono text-lg">{debounced}</div>
          <div className="text-foreground/50">멈춘 뒤 1번</div>
        </div>
        <div className={cell}>
          throttle
          <div className="mt-1 font-mono text-lg">{throttled}</div>
          <div className="text-foreground/50">{DELAY}ms 간격</div>
        </div>
      </div>
      <button
        className="w-fit rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
        onClick={reset}
      >
        리셋
      </button>
      <p className="text-xs text-foreground/50">
        raw는 폭발하지만, debounce는 입력을 멈출 때만, throttle은 일정 간격으로만
        증가합니다.
      </p>
    </div>
  );
}
