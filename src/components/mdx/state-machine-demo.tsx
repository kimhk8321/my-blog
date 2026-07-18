"use client";

import { useEffect, useReducer, useState } from "react";

type State = "idle" | "submitting" | "success" | "error";
type Event = "SUBMIT" | "RESOLVE" | "REJECT" | "RETRY" | "RESET";

// 전이표: 각 상태에서 어떤 이벤트가 어떤 상태로 가는지만 정의
const machine: Record<State, Partial<Record<Event, State>>> = {
  idle: { SUBMIT: "submitting" },
  submitting: { RESOLVE: "success", REJECT: "error" },
  success: { RESET: "idle" },
  error: { RETRY: "submitting", RESET: "idle" },
};

function reducer(state: State, event: Event): State {
  return machine[state][event] ?? state; // 정의 안 된 전이는 무시
}

const label: Record<State, string> = {
  idle: "대기 (idle)",
  submitting: "제출 중 (submitting)",
  success: "성공 (success)",
  error: "실패 (error)",
};

const color: Record<State, string> = {
  idle: "bg-foreground/10 text-foreground/70",
  submitting: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  success: "bg-green-500/20 text-green-700 dark:text-green-300",
  error: "bg-red-500/20 text-red-700 dark:text-red-300",
};

const btn =
  "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function StateMachineDemo() {
  const [state, dispatch] = useReducer(reducer, "idle");
  const [failMode, setFailMode] = useState(false);

  // submitting에 들어가면 1.2초 뒤 성공/실패로 자동 전이
  useEffect(() => {
    if (state !== "submitting") return;
    const t = setTimeout(
      () => dispatch(failMode ? "REJECT" : "RESOLVE"),
      1200,
    );
    return () => clearTimeout(t);
  }, [state, failMode]);

  const events = Object.keys(machine[state]) as Event[];

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        현재 상태:{" "}
        <span
          className={`rounded-md px-2 py-1 font-mono text-xs ${color[state]}`}
        >
          {label[state]}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {events.length === 0 && (
          <span className="text-xs text-foreground/40">
            (자동 전이 대기 중…)
          </span>
        )}
        {events.map((ev) => (
          <button key={ev} className={btn} onClick={() => dispatch(ev)}>
            {ev}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={failMode}
          onChange={(e) => setFailMode(e.target.checked)}
        />
        제출 실패 시뮬레이션
      </label>

      <p className="text-xs text-foreground/50">
        허용된 이벤트 버튼만 나타납니다. 예컨대 <code>submitting</code> 중엔
        <code> SUBMIT</code>이 없어 중복 제출이 원천 차단됩니다.
      </p>
    </div>
  );
}
