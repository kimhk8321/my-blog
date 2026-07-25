"use client";

import { useReducer } from "react";

type State = { past: number[]; present: number; future: number[] };
type Action =
  | { type: "do"; next: number }
  | { type: "undo" }
  | { type: "redo" };

function reducer(state: State, action: Action): State {
  const { past, present, future } = state;
  switch (action.type) {
    case "do":
      return { past: [...past, present], present: action.next, future: [] };
    case "undo":
      if (!past.length) return state;
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future],
      };
    case "redo":
      if (!future.length) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };
  }
}

const btn =
  "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] disabled:opacity-40 dark:border-white/20";

export function UndoRedoDemo() {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: 0,
    future: [],
  });

  const change = (fn: (n: number) => number) =>
    dispatch({ type: "do", next: fn(state.present) });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      dispatch({ type: "undo" });
    } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
      e.preventDefault();
      dispatch({ type: "redo" });
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-3 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-400/50"
    >
      <div className="text-center text-3xl font-bold tabular-nums">
        {state.present}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button className={btn} onClick={() => change((n) => n + 1)}>
          +1
        </button>
        <button className={btn} onClick={() => change((n) => n - 1)}>
          −1
        </button>
        <button className={btn} onClick={() => change((n) => n * 2)}>
          ×2
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          className={btn}
          onClick={() => dispatch({ type: "undo" })}
          disabled={!state.past.length}
        >
          ↩ Undo ({state.past.length})
        </button>
        <button
          className={btn}
          onClick={() => dispatch({ type: "redo" })}
          disabled={!state.future.length}
        >
          Redo ({state.future.length}) ↪
        </button>
      </div>

      <p className="text-center text-xs text-foreground/50">
        이 영역을 클릭한 뒤 <b>Ctrl/⌘+Z</b>(undo), <b>Ctrl/⌘+Shift+Z</b> 또는
        <b> Ctrl/⌘+Y</b>(redo)도 됩니다.
      </p>
    </div>
  );
}
