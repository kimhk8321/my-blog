"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

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

const CHOSUNG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

// 한글 음절이면 초성을, 아니면 글자 그대로 반환 ("다" → "ㄷ")
function toChosung(ch: string): string {
  const offset = ch.charCodeAt(0) - 0xac00;
  if (offset < 0 || offset > 11171) return ch;
  return CHOSUNG[Math.floor(offset / 588)];
}

// 부분 순서 매칭(subsequence) 기반 퍼지 검색 + 초성 매칭
function fuzzy(query: string, text: string): boolean {
  const q = [...query.toLowerCase().replace(/\s/g, "")];
  if (q.length === 0) return true;
  let qi = 0;
  for (const ch of text.toLowerCase()) {
    if (ch === q[qi] || toChosung(ch) === q[qi]) qi++;
    if (qi === q.length) return true;
  }
  return false;
}

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState("—");
  // 서버 렌더에서는 ⌘K, 브라우저에서는 윈도우·리눅스면 Ctrl K로 표시
  const shortcut = useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "⌘K",
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(
    () => commands.filter((c) => fuzzy(query, c)),
    [query],
  );

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
    triggerRef.current?.focus(); // 닫으면 연 위치로 포커스 복귀
  };

  const choose = (cmd?: string) => {
    if (cmd) setChosen(cmd);
    close();
  };

  // 리스너는 한 번만 등록하고, 실행 시점의 최신 open 값을 읽는다
  const toggle = useEffectEvent(() => {
    if (open) close();
    else setOpen(true);
  });

  // 전역 단축키: ⌘K(맥) / Ctrl+K(윈도우)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // 브라우저 기본 동작(주소창 검색) 차단
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // 활성 항목이 목록 밖으로 나가면 그만큼만 스크롤
  useEffect(() => {
    const list = listRef.current;
    const item = list?.children[active] as HTMLElement | undefined;
    if (!list || !item) return;
    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // 한글 조합 중의 Enter·화살표는 IME가 처리하도록 둔다
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(a + 1, filtered.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      // 기본 동작을 막지 않으면 포커스가 돌아간 "팔레트 열기" 버튼이 같은 Enter로 눌린다
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    <div className="not-prose relative min-h-[260px] rounded-md border border-black/10 p-4 dark:border-white/15">
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
      >
        팔레트 열기 <kbd className="ml-1 text-xs text-foreground/50">{shortcut}</kbd>
      </button>
      <div className="mt-3 text-sm">
        선택된 명령: <b>{chosen}</b>
      </div>

      {open && (
        <div
          className="absolute inset-0 flex justify-center rounded-md bg-black/40 pt-6"
          onClick={close}
        >
          <div
            className="h-fit w-64 overflow-hidden rounded-lg bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0); // 검색어가 바뀌면 선택을 처음으로
              }}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-list"
              aria-activedescendant={filtered[active] ? `command-option-${active}` : undefined}
              placeholder="명령 검색… (예: ㄷㅋ → 다크)"
              className="w-full border-b border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/15"
            />
            <ul
              ref={listRef}
              id="command-palette-list"
              role="listbox"
              className="relative max-h-48 overflow-auto py-1"
            >
              {filtered.map((c, i) => (
                <li
                  key={c}
                  id={`command-option-${i}`}
                  role="option"
                  aria-selected={i === active}
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
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-foreground/40">결과 없음</p>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-foreground/50">
        {shortcut} 또는 버튼으로 열고 타이핑하면 퍼지 검색(부분 순서 + 초성 매칭)으로
        필터됩니다. ↑↓로 이동, Enter 선택, Esc 닫기.
      </p>
    </div>
  );
}
