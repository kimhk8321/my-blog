"use client";

import { useState } from "react";

// 데모용 인메모리 라우터 (실제 브라우저 URL은 건드리지 않음)
const routes: Record<string, { title: string; body: string }> = {
  "/": { title: "홈", body: "미니 라우터의 첫 화면입니다." },
  "/about": { title: "소개", body: "route → 컴포넌트 매핑만으로 화면이 바뀝니다." },
  "/posts": { title: "글 목록", body: "새로고침 없이 화면만 교체됩니다." },
};

const linkBtn =
  "rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function MiniRouterDemo() {
  const [path, setPath] = useState("/");
  const page = routes[path] ?? { title: "404", body: "없는 경로입니다." };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <nav className="flex flex-wrap gap-2">
        {Object.keys(routes).map((p) => (
          <button
            key={p}
            className={`${linkBtn} ${p === path ? "bg-foreground/[0.08] font-medium" : ""}`}
            onClick={() => setPath(p)}
          >
            {p}
          </button>
        ))}
      </nav>

      <div className="rounded-md border border-black/10 p-4 dark:border-white/15">
        <div className="text-xs text-foreground/50">현재 경로: <code>{path}</code></div>
        <h4 className="mt-1 font-semibold">{page.title}</h4>
        <p className="mt-1 text-foreground/70">{page.body}</p>
      </div>

      <p className="text-xs text-foreground/50">
        (데모는 실제 URL을 바꾸지 않도록 상태로만 라우팅합니다. 실제 구현은 아래
        코드처럼 History API를 씁니다.)
      </p>
    </div>
  );
}
