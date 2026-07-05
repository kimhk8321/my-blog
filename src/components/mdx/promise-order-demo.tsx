"use client";

import { useState } from "react";

const btn =
  "rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function PromiseOrderDemo() {
  const [log, setLog] = useState<string[]>([]);

  const run = () => {
    setLog([]);
    const add = (m: string) => setLog((l) => [...l, m]);

    add("1 · 동기 코드");
    setTimeout(() => add("4 · setTimeout 콜백 (매크로태스크)"), 0);
    Promise.resolve().then(() => add("3 · Promise.then (마이크로태스크)"));
    add("2 · 동기 코드");
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <pre className="not-prose overflow-x-auto rounded-md bg-foreground/[0.05] p-3 text-xs">
        {`console.log("1 · 동기 코드");
setTimeout(() => log("4 · 매크로"), 0);
Promise.resolve().then(() => log("3 · 마이크로"));
console.log("2 · 동기 코드");`}
      </pre>

      <div>
        <button className={btn} onClick={run}>실행</button>
      </div>

      <ol className="flex flex-col gap-1 rounded-md border border-black/10 p-3 font-mono text-xs dark:border-white/15">
        {log.length === 0 ? (
          <li className="text-foreground/40">실행을 누르면 순서가 기록됩니다.</li>
        ) : (
          log.map((l, i) => <li key={i}>{l}</li>)
        )}
      </ol>

      <p className="text-xs text-foreground/50">
        동기 코드가 먼저 다 끝난 뒤 → 마이크로태스크(Promise) → 매크로태스크
        (setTimeout) 순으로 실행됩니다.
      </p>
    </div>
  );
}
