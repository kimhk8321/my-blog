"use client";

import { useState } from "react";

type Seg = { t: string; mark?: boolean };

function highlight(text: string, re: RegExp): { segs: Seg[]; count: number } {
  const segs: Seg[] = [];
  let last = 0;
  let count = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(text))) {
    count++;
    if (m.index > last) segs.push({ t: text.slice(last, m.index) });
    segs.push({ t: m[0], mark: true });
    last = m.index + m[0].length;
    if (m[0] === "") re.lastIndex++; // 제로 길이 매치 무한루프 방지
    if (!re.global) break;
  }
  if (last < text.length) segs.push({ t: text.slice(last) });
  return { segs, count };
}

export function RegexTesterDemo() {
  const [pattern, setPattern] = useState("\\b[\\w.]+@[\\w.]+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState(
    "문의는 a@b.com 또는 hello@world.io 로,\n전화는 010-1234-5678 로 주세요.",
  );

  let error: string | null = null;
  let segs: Seg[] = [{ t: text }];
  let count = 0;
  try {
    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const r = highlight(text, re);
    segs = r.segs;
    count = r.count;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2 font-mono">
        <span className="text-foreground/40">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
        />
        <span className="text-foreground/40">/</span>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          className="w-16 rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none dark:border-white/20"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
      />

      <div className="rounded-md border border-black/10 p-3 dark:border-white/15">
        {error ? (
          <span className="text-red-500">⚠ {error}</span>
        ) : (
          <>
            <div className="mb-1 text-xs text-foreground/50">
              매치 <b>{count}</b>개
            </div>
            <div className="whitespace-pre-wrap break-words font-mono text-sm">
              {segs.map((s, i) =>
                s.mark ? (
                  <mark key={i} className="rounded bg-yellow-300 px-0.5 text-black">
                    {s.t}
                  </mark>
                ) : (
                  <span key={i}>{s.t}</span>
                ),
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-foreground/50">
        패턴과 플래그를 바꿔 보세요. 매치되는 부분이 실시간으로 하이라이트됩니다.
      </p>
    </div>
  );
}
