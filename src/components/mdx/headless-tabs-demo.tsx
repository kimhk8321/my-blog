"use client";

import { useState } from "react";

const tabs = [
  { label: "개요", body: "헤드리스 컴포넌트는 동작·접근성만 제공하고 스타일은 사용자에게 맡깁니다." },
  { label: "사용법", body: "상태와 ARIA 속성, 키보드 처리만 컴포넌트가 담당합니다." },
  { label: "접근성", body: "role, aria-selected, 화살표 키 이동까지 기본 제공됩니다." },
];

export function HeadlessTabsDemo() {
  const [active, setActive] = useState(0);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((a) => (a + 1) % tabs.length);
    if (e.key === "ArrowLeft")
      setActive((a) => (a - 1 + tabs.length) % tabs.length);
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div role="tablist" aria-label="예시 탭" className="flex gap-1">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              active === i
                ? "bg-indigo-500 text-white"
                : "bg-foreground/[0.05] hover:bg-foreground/[0.1]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className="rounded-md border border-black/10 p-4 dark:border-white/15"
      >
        {tabs[active].body}
      </div>

      <p className="text-xs text-foreground/50">
        탭을 클릭하거나, 탭에 포커스를 두고 <b>← →</b> 키로 이동해 보세요.
      </p>
    </div>
  );
}
