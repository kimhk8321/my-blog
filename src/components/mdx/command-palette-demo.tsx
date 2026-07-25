"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const commands = [
  "새 글 작성",
  "다크 모드 전환",
  "설정 열기",
  "게시글 검색",
  "카테고리 관리",
  "태그 편집",
  "댓글 보기",
  "프로필 수정",
  "로그아웃",
];

// 부분 순서 매칭(subsequence) 기반 퍼지 검색
function fuzzy(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (const ch of t) {
    if (ch === q[qi]) qi++;
    if (qi === q.length) return true;
  }
  return qi === q.length;
}

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState("—");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(
    () => commands.filter((c) => fuzzy(query, c)),
    [query],
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => setActive(0), [query]);

  const choose = (cmd?: string) => {
    if (cmd) setChosen(cmd);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative min-h-[260px] rounded-md border border-black/10 p-4 dark:border-white/15">
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
      >
        팔레트 열기 <kbd className="ml-1 text-xs text-foreground/50">⌘K</kbd>
      </button>
      <div className="mt-3 text-sm">
        선택된 명령: <b>{chosen}</b>
      </div>

      {open && (
        <div
          className="absolute inset-0 flex justify-center rounded-md bg-black/40 pt-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="h-fit w-64 overflow-hidden rounded-lg bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="명령 검색… (예: ㄷㅋ → 다크)"
              className="w-full border-b border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/15"
            />
            <ul className="max-h-48 overflow-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-foreground/40">
                  결과 없음
                </li>
              )}
              {filtered.map((c, i) => (
                <li
                  key={c}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(c)}
                  className={`cursor-pointer px-3 py-1.5 text-sm ${
                    i === active ? "bg-indigo-500 text-white" : ""
                  }`}
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-foreground/50">
        열고 타이핑하면 퍼지 검색(부분 순서 매칭)으로 필터됩니다. ↑↓로 이동,
        Enter 선택, Esc 닫기.
      </p>
    </div>
  );
}
