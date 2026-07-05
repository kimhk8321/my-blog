"use client";

import { useReducer, useState } from "react";

type Todo = { id: number; text: string; done: boolean };
type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: number }
  | { type: "remove"; id: number };

let nextId = 3;

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [...state, { id: nextId++, text: action.text, done: false }];
    case "toggle":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "remove":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

const initial: Todo[] = [
  { id: 1, text: "useReducer 이해하기", done: true },
  { id: 2, text: "데모 만들어 보기", done: false },
];

export function ReducerTodoDemo() {
  const [todos, dispatch] = useReducer(reducer, initial);
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    dispatch({ type: "add", text: t });
    setText("");
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex gap-2">
        <input
          className="w-full max-w-xs rounded-md border border-black/15 px-3 py-1.5 dark:border-white/20"
          placeholder="할 일을 입력하고 Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          className="rounded-md border border-black/15 px-3 py-1 transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
          onClick={add}
        >
          추가
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch({ type: "toggle", id: todo.id })}
            />
            <span className={todo.done ? "text-foreground/40 line-through" : ""}>
              {todo.text}
            </span>
            <button
              className="ml-auto text-xs text-foreground/40 hover:text-red-500"
              onClick={() => dispatch({ type: "remove", id: todo.id })}
            >
              삭제
            </button>
          </li>
        ))}
        {todos.length === 0 && (
          <li className="text-xs text-foreground/40">할 일이 없습니다.</li>
        )}
      </ul>

      <p className="text-xs text-foreground/50">
        추가·토글·삭제 로직이 모두 <code>reducer</code> 한 곳에 모여 있습니다.
      </p>
    </div>
  );
}
