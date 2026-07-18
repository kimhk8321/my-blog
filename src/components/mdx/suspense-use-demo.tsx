"use client";

import { Suspense, use, useState } from "react";

const messages = [
  "서버에서 온 데이터 🎉",
  "두 번째 응답 📦",
  "세 번째 응답 ✨",
];

function fetchData(n: number): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(messages[n % messages.length]), 1500),
  );
}

function Data({ promise }: { promise: Promise<string> }) {
  const value = use(promise); // 프라미스가 확정될 때까지 Suspense가 잡아줌
  return (
    <p className="rounded-md bg-green-500/10 px-3 py-2 text-green-700 dark:text-green-300">
      {value}
    </p>
  );
}

const btn =
  "w-fit rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function SuspenseUseDemo() {
  const [promise, setPromise] = useState<Promise<string> | null>(null);
  const [n, setN] = useState(0);

  const load = () => {
    setPromise(fetchData(n));
    setN((v) => v + 1);
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <button className={btn} onClick={load}>
        {promise ? "다시 불러오기" : "불러오기"}
      </button>

      {promise && (
        <Suspense
          fallback={
            <p className="rounded-md bg-foreground/[0.05] px-3 py-2 text-foreground/60">
              로딩 중…
            </p>
          }
        >
          <Data promise={promise} />
        </Suspense>
      )}

      <p className="text-xs text-foreground/50">
        버튼을 누르면 1.5초 뒤 데이터가 도착합니다. 로딩 표시는 우리가
        그리는 게 아니라 <code>Suspense</code>의 fallback이 대신합니다.
      </p>
    </div>
  );
}
