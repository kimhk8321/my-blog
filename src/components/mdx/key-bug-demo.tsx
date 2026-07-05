"use client";

import { useState } from "react";

type Item = { id: number; label: string };
const initial: Item[] = [
  { id: 1, label: "사과" },
  { id: 2, label: "바나나" },
  { id: 3, label: "체리" },
];

let nextId = 100;

const btn =
  "rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function KeyBugDemo() {
  const [items, setItems] = useState<Item[]>(initial);
  const [keyMode, setKeyMode] = useState<"index" | "id">("index");

  const prepend = () => {
    const id = nextId++;
    setItems((prev) => [{ id, label: `새 과일 ${id}` }, ...prev]);
  };
  const removeFirst = () => setItems((prev) => prev.slice(1));
  const reset = () => setItems([...initial]);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-foreground/60">key 방식:</span>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={keyMode === "index"}
            onChange={() => setKeyMode("index")}
          />
          <code>key={"{index}"}</code>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={keyMode === "id"}
            onChange={() => setKeyMode("id")}
          />
          <code>key={"{item.id}"}</code>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={prepend}>맨 앞에 추가</button>
        <button className={btn} onClick={removeFirst}>맨 앞 삭제</button>
        <button className={btn} onClick={reset}>리셋</button>
      </div>

      <ul className="flex flex-col gap-1">
        {items.map((item, index) => (
          <li
            key={keyMode === "index" ? index : item.id}
            className="flex items-center gap-2"
          >
            <span className="w-24 shrink-0 text-foreground/60">{item.label}</span>
            <input
              defaultValue={item.label}
              className="w-full max-w-xs rounded border border-black/15 px-2 py-0.5 text-xs dark:border-white/20"
            />
          </li>
        ))}
      </ul>

      <p className="text-xs text-foreground/50">
        각 입력칸의 값을 아무거나 바꾼 뒤 <b>맨 앞 삭제</b>를 눌러 보세요.
        <br />
        <code>key={"{index}"}</code>면 입력값(비제어 DOM 상태)이 엉뚱한 행에
        남고, <code>key={"{item.id}"}</code>면 항목을 따라 정확히 이동합니다.
      </p>
    </div>
  );
}
