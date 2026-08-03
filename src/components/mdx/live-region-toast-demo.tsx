"use client";

import { useRef, useState } from "react";

type Toast = { id: number; msg: string; tone: "ok" | "err" };

export function LiveRegionToastDemo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const add = (msg: string, tone: Toast["tone"]) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const btn =
    "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={() => add("저장되었습니다", "ok")}>
          저장
        </button>
        <button className={btn} onClick={() => add("삭제에 실패했습니다", "err")}>
          삭제(실패)
        </button>
      </div>

      {/* aria-live 영역: 새 자식이 들어오면 스크린리더가 자동으로 읽는다 */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="flex min-h-[2.5rem] flex-col gap-1.5"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`w-fit rounded-md px-3 py-1.5 text-sm text-white shadow ${
              t.tone === "ok" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <p className="text-xs text-foreground/50">
        버튼을 누르면 토스트가 뜹니다. 이 영역은 <code>aria-live=&quot;polite&quot;</code>
        라서, 눈에 보이는 것과 별개로 <b>스크린리더가 메시지를 소리 내어 읽어
        줍니다.</b>
      </p>
    </div>
  );
}
