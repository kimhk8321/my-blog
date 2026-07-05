"use client";

import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(
  null,
);

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeProvider 안에서 사용하세요");
  return ctx;
}

// Provider와 소비 컴포넌트 사이에 낀 "중간 컴포넌트" — props를 받지 않는다
function Middle() {
  return (
    <div className="rounded-md border border-dashed border-black/15 p-3 dark:border-white/20">
      <p className="mb-2 text-xs text-foreground/50">
        중간 컴포넌트 (props 전달 없음)
      </p>
      <DeepChild />
    </div>
  );
}

function DeepChild() {
  const { theme, toggle } = useTheme(); // props drilling 없이 바로 소비
  return (
    <div
      className={`rounded-md p-4 ${
        theme === "dark" ? "bg-neutral-800 text-neutral-100" : "bg-neutral-100 text-neutral-900"
      }`}
    >
      <p className="text-sm">
        현재 테마: <b>{theme}</b>
      </p>
      <button
        className="mt-2 rounded-md border border-current/30 px-3 py-1 text-xs"
        onClick={toggle}
      >
        토글
      </button>
    </div>
  );
}

export function ContextThemeDemo() {
  const [theme, setTheme] = useState<Theme>("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-xs text-foreground/50">
          Provider → 중간 → 깊은 자식. 중간을 거치지 않고 값이 전달됩니다.
        </p>
        <Middle />
      </div>
    </ThemeContext.Provider>
  );
}
