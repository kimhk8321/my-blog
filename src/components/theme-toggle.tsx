"use client";

import { useSyncExternalStore } from "react";

/**
 * 테마는 React 밖(문서의 class)에 있는 상태다.
 * 효과에서 setState로 따라가면 렌더가 한 번 더 도니, 외부 저장소를 직접 구독한다.
 */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle() {
  // 서버에서는 알 수 없으므로 false로 그리고, 하이드레이션 후 실제 값으로 맞춘다.
  const dark = useSyncExternalStore(subscribeToTheme, isDark, () => false);

  function toggle() {
    const next = !dark;
    // class를 바꾸면 위 구독이 알아서 다시 그린다.
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="테마 전환"
      className="grid size-8 place-items-center rounded-md border border-black/10 text-foreground/70 hover:text-foreground hover:bg-black/5 transition-colors dark:border-white/15 dark:hover:bg-white/10"
    >
      {dark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
