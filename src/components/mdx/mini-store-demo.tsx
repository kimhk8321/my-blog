"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type State = { count: number; step: number };
type Listener = () => void;

// 글에서 만드는 미니 스토어 — React와 무관한 순수 자바스크립트
function createStore(initial: State) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState: (partial: Partial<State> | ((s: State) => Partial<State>)) => {
      const next = typeof partial === "function" ? partial(state) : partial;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const store = createStore({ count: 0, step: 1 });

// selector로 원하는 조각만 구독 → 그 조각이 바뀔 때만 리렌더
function useStore<T>(selector: (s: State) => T): T {
  const getSnapshot = () => selector(store.getState());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

// 값이 바뀌어 리렌더될 때 잠깐 반짝이게 한다 (초기 마운트는 건너뜀)
function useChangeFlash(value: unknown) {
  const [flash, setFlash] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, [value]);
  return flash;
}

const box = "rounded-md px-3 py-2 transition-colors duration-300";
const flashOn = "bg-green-500/20 ring-1 ring-green-500/40";
const flashOff = "bg-foreground/[0.05]";

const btn =
  "rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

function CountView() {
  const count = useStore((s) => s.count);
  const flash = useChangeFlash(count);
  return (
    <div className={`${box} ${flash ? flashOn : flashOff}`}>
      count = <b className="font-mono">{count}</b>{" "}
      <span className="text-xs text-foreground/50">— count만 구독</span>
    </div>
  );
}

function StepView() {
  const step = useStore((s) => s.step);
  const flash = useChangeFlash(step);
  return (
    <div className={`${box} ${flash ? flashOn : flashOff}`}>
      step = <b className="font-mono">{step}</b>{" "}
      <span className="text-xs text-foreground/50">— step만 구독</span>
    </div>
  );
}

export function MiniStoreDemo() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <CountView />
      <StepView />
      <div className="flex flex-wrap gap-2">
        <button
          className={btn}
          onClick={() => store.setState((s) => ({ count: s.count + s.step }))}
        >
          + step
        </button>
        <button className={btn} onClick={() => store.setState({ count: 0 })}>
          reset count
        </button>
        <button
          className={btn}
          onClick={() => store.setState((s) => ({ step: s.step + 1 }))}
        >
          step +1
        </button>
      </div>
      <p className="text-xs text-foreground/50">
        &quot;+ step&quot;으로 count를 바꾸면 <b>count 박스만</b> 초록으로
        반짝입니다 — step 박스는 리렌더되지 않습니다(선택적 구독).
      </p>
    </div>
  );
}
