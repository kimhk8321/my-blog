"use client";

import { useEffect, useRef, useState } from "react";

const N = 5_000_000;

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

const workerCode = `const countPrimes = ${countPrimes.toString()};
self.onmessage = ({ data }) => {
  const start = performance.now();
  const count = countPrimes(data);
  self.postMessage({ count, duration: performance.now() - start });
};`;

const btn =
  "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] disabled:opacity-40 dark:border-white/20";

export function WebWorkerDemo() {
  const [main, setMain] = useState<string>("–");
  const [worker, setWorker] = useState<string>("–");
  const [mainBusy, setMainBusy] = useState(false);
  const [workerBusy, setWorkerBusy] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const mainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `rotate(${((now - start) / 1000) * 360}deg)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      if (mainTimerRef.current !== null) clearTimeout(mainTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    workerRef.current = w;
    return () => {
      w.terminate();
      URL.revokeObjectURL(url);
      workerRef.current = null;
    };
  }, []);

  const runMain = () => {
    setMainBusy(true);
    setMain("계산 중…");
    mainTimerRef.current = setTimeout(() => {
      const start = performance.now();
      const c = countPrimes(N);
      setMain(`소수 ${c.toLocaleString()}개 (${Math.round(performance.now() - start)}ms)`);
      setMainBusy(false);
      mainTimerRef.current = null;
    }, 30);
  };

  const runWorker = () => {
    const w = workerRef.current;
    if (!w) return;
    setWorkerBusy(true);
    setWorker("계산 중…");
    w.onmessage = (e: MessageEvent<{ count: number; duration: number }>) => {
      setWorker(`소수 ${e.data.count.toLocaleString()}개 (${Math.round(e.data.duration)}ms)`);
      setWorkerBusy(false);
    };
    w.postMessage(N);
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div ref={spinnerRef} role="img" aria-label="메인 스레드 애니메이션" className="h-6 w-6 shrink-0 rounded-full border-2 border-foreground/20 border-t-foreground/70" />
        <span className="text-xs text-foreground/50">
          JavaScript로 회전하는 스피너 · 메인 스레드가 막히면 멈춥니다
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={runMain} disabled={mainBusy || workerBusy}>
          메인 스레드에서 계산
        </button>
        <button className={btn} onClick={runWorker} disabled={mainBusy || workerBusy}>
          워커에서 계산
        </button>
      </div>

      <div className="font-mono text-xs">
        <div role="status" aria-label="메인 스레드 계산 결과">
          메인 스레드: <b>{main}</b>{" "}
          {mainBusy && <span className="text-red-500">(스피너 멈춤!)</span>}
        </div>
        <div role="status" aria-label="워커 계산 결과">
          워커: <b>{worker}</b>{" "}
          {workerBusy && (
            <span className="text-green-600 dark:text-green-400">
              (스피너 계속 돎)
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-foreground/50">
        두 방식 모두 500만 미만의 소수를 셉니다. 계산 시간은 기기마다 달라집니다.
        CSS 회전은 메인 스레드가 막혀도 계속 움직일 수 있어,
        이 데모는 requestAnimationFrame으로 프레임을 갱신합니다.
      </p>
    </div>
  );
}
