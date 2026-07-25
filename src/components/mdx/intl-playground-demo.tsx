"use client";

import { useState } from "react";

const locales = [
  { id: "ko-KR", label: "한국어", currency: "KRW" },
  { id: "en-US", label: "English (US)", currency: "USD" },
  { id: "ja-JP", label: "日本語", currency: "JPY" },
  { id: "de-DE", label: "Deutsch", currency: "EUR" },
];

// SSR/CSR 불일치를 피하려 '지금'이 아닌 고정 시각을 쓴다.
const SAMPLE_DATE = new Date("2026-07-25T15:30:00Z");

export function IntlPlaygroundDemo() {
  const [localeId, setLocaleId] = useState("ko-KR");
  const [num, setNum] = useState(1234567.89);

  const loc = locales.find((l) => l.id === localeId)!;

  const rows = [
    ["통화", new Intl.NumberFormat(localeId, { style: "currency", currency: loc.currency }).format(num)],
    ["소수", new Intl.NumberFormat(localeId, { maximumFractionDigits: 2 }).format(num)],
    ["퍼센트", new Intl.NumberFormat(localeId, { style: "percent" }).format(0.1234)],
    ["날짜", new Intl.DateTimeFormat(localeId, { dateStyle: "full" }).format(SAMPLE_DATE)],
    ["시간", new Intl.DateTimeFormat(localeId, { timeStyle: "short" }).format(SAMPLE_DATE)],
    ["상대시간", new Intl.RelativeTimeFormat(localeId, { numeric: "auto" }).format(-3, "day")],
  ] as const;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={localeId}
          onChange={(e) => setLocaleId(e.target.value)}
          className="rounded-md border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
        >
          {locales.map((l) => (
            <option key={l.id} value={l.id} className="dark:bg-neutral-900">
              {l.label} ({l.id})
            </option>
          ))}
        </select>
        <input
          type="number"
          value={num}
          onChange={(e) => setNum(Number(e.target.value))}
          className="w-40 rounded-md border border-black/15 px-2 py-1.5 text-sm dark:border-white/20"
        />
      </div>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-black/5 dark:border-white/10">
              <td className="py-1.5 pr-3 text-foreground/60">{label}</td>
              <td className="py-1.5 font-mono">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-foreground/50">
        로케일만 바꿔도 통화 기호·자릿수 구분·날짜 형식·어순이 전부 알아서
        바뀝니다. 직접 문자열을 조립하지 마세요.
      </p>
    </div>
  );
}
