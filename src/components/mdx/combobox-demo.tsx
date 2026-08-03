"use client";

import { useId, useState } from "react";

const OPTIONS = [
  "React", "React Native", "Redux", "Recoil", "Remix",
  "Next.js", "Nuxt", "Svelte", "SvelteKit", "Solid",
  "Vue", "Angular", "Astro", "Qwik",
];

export function ComboboxDemo() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState("");
  const listId = useId();

  const filtered = OPTIONS.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  const choose = (value: string) => {
    setSelected(value);
    setQuery(value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="relative w-64 max-w-full">
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder="프레임워크 검색…"
          className="w-full rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
        />

        {open && filtered.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-black/10 bg-background py-1 shadow-lg dark:border-white/15"
          >
            {filtered.map((opt, i) => (
              <li
                key={opt}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(opt);
                }}
                className={`cursor-pointer px-3 py-1.5 ${
                  i === active ? "bg-indigo-500 text-white" : ""
                }`}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-foreground/60">
        선택됨: <b>{selected || "—"}</b>
      </div>
      <p className="text-xs text-foreground/50">
        타이핑해 걸러내고 <b>↑↓</b>로 이동, <b>Enter</b>로 선택, <b>Esc</b>로
        닫습니다. <code>role=&quot;combobox&quot;</code>·<code>aria-activedescendant</code>로
        스크린리더도 현재 항목을 읽습니다.
      </p>
    </div>
  );
}
