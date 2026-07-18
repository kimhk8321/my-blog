"use client";

import { useEffect, useRef, useState } from "react";

// 워커에서 돌 코드 — n 미만의 소수 개수를 세는 무거운 계산
const workerCode = `self.onmessage=(e)=>{const n=e.data;let c=0;for(let i=2;i<n;i++){let p=true;for(let j=2;j*j<=i;j++){if(i%j===0){p=false;break;}}if(p)c++;}postMessage(c);};`;

const N = 1_000_000;

function countPrimes(n: number) {
  let c = 0;
  for (let i = 2; i < n; i++) {
    let p = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        p = false;
        break;
      }
    }
    if (p) c++;
  }
  return c;
}

const btn =
  "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] disabled:opacity-40 dark:border-white/20";

export function WebWorkerDemo() {
  const [main, setMain] = useState<string>("–");
  const [worker, setWorker] = useState<string>("–");
  const [mainBusy, setMainBusy] = useState(false);
  const [workerBusy, setWorkerBusy] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    workerRef.current = w;
    return () => {
      w.terminate();
      URL.revokeObjectURL(url);
    };
  }, []);

  const runMain = () => {
    setMainBusy(true);
    setMain("계산 중…");
    // 상태가 먼저 그려지도록 한 틱 양보한 뒤 동기 계산(=메인 스레드 블로킹)
    setTimeout(() => {
      const c = countPrimes(N);
      setMain(`소수 ${c.toLocaleString()}개`);
      setMainBusy(false);
    }, 30);
  };

  const runWorker = () => {
    const w = workerRef.current;
    if (!w) return;
    setWorkerBusy(true);
    setWorker("계산 중…");
    w.onmessage = (e: MessageEvent<number>) => {
      setWorker(`소수 ${e.data.toLocaleString()}개`);
      setWorkerBusy(false);
    };
    w.postMessage(N);
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70" />
        <span className="text-xs text-foreground/50">
          이 스피너가 계속 돌아야 UI가 안 멈춘 겁니다
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={runMain} disabled={mainBusy}>
          메인 스레드에서 계산
        </button>
        <button className={btn} onClick={runWorker} disabled={workerBusy}>
          워커에서 계산
        </button>
      </div>

      <div className="font-mono text-xs">
        <div>
          메인 스레드: <b>{main}</b>{" "}
          {mainBusy && <span className="text-red-500">(스피너 멈춤!)</span>}
        </div>
        <div>
          워커: <b>{worker}</b>{" "}
          {workerBusy && (
            <span className="text-green-600 dark:text-green-400">
              (스피너 계속 돎)
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-foreground/50">
        같은 계산인데, 메인 스레드로 돌리면 스피너가 얼어붙고, 워커로 돌리면
        매끄럽게 돕니다.
      </p>
    </div>
  );
}
