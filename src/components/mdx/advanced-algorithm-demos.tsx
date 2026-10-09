"use client";

import { useId, useState } from "react";

const buttonClass = "rounded-md border border-black/15 px-3 py-1.5 hover:bg-foreground/[0.06] disabled:opacity-40 dark:border-white/20";
const fieldClass = "rounded-md border border-black/20 bg-background px-2 py-1.5 dark:border-white/20";
const prefixValues = [3, 4, -7, 1, 3, 3, 1, -4];

function prefixFrames(target: number) {
  let prefix = 0;
  let answer = 0;
  const counts = new Map([[0, 1]]);
  const snapshot = (index: number, phase: string, added: number) => ({
    index, phase, prefix, answer, added, lookup: prefix - target, counts: [...counts],
  });
  const frames = [snapshot(-1, "시작 전", 0)];
  prefixValues.forEach((value, index) => {
    prefix += value;
    frames.push(snapshot(index, "① 누적합 계산", 0));
    const added = counts.get(prefix - target) ?? 0;
    answer += added;
    frames.push(snapshot(index, "② 과거 누적합 조회", added));
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    frames.push(snapshot(index, "③ 현재 누적합 등록", added));
  });
  return frames;
}

export function PrefixCountsDemo() {
  const id = useId();
  const [target, setTarget] = useState(7);
  const [step, setStep] = useState(0);
  const frames = prefixFrames(target);
  const frame = frames[step];
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id}>target</label>
        <select id={id} className={fieldClass} value={target} onChange={(event) => { setTarget(Number(event.target.value)); setStep(0); }}>
          {[7, -3, 0].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <span className="text-foreground/60">{frame.phase}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="누적합 입력 배열">
        {prefixValues.map((value, index) => (
          <div key={index} className={`rounded-md p-2 text-center font-mono ${index === frame.index ? "bg-blue-600 text-white" : "bg-foreground/[0.06]"}`}>
            {value}<span className="block text-[10px] opacity-70">i={index}</span>
          </div>
        ))}
      </div>
      <p role="status">prefix {frame.prefix} · 조회 key {frame.lookup} · 추가 {frame.added}개 · 누적 답 {frame.answer}</p>
      <div aria-label="현재 counts" className="flex flex-wrap gap-2">
        {frame.counts.map(([key, frequency]) => (
          <span key={key} className={`rounded-md px-2 py-1 font-mono ${frame.index >= 0 && key === frame.lookup && frame.phase.startsWith("②") ? "bg-blue-600 text-white" : "bg-foreground/[0.06]"}`}>
            {key}: {frequency}
          </span>
        ))}
      </div>
      <p className="text-xs text-foreground/60">②는 등록 전 빈도를 조회하고, ③에서 현재 prefix를 등록합니다.</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={buttonClass} disabled={step === 0} onClick={() => setStep(step - 1)}>이전 단계</button>
        <button type="button" className={buttonClass} disabled={step === frames.length - 1} onClick={() => setStep(step + 1)}>다음 단계</button>
        <button type="button" className={buttonClass} onClick={() => setStep(0)}>처음으로</button>
        <span className="text-xs text-foreground/60">{step + 1} / {frames.length}</span>
      </div>
    </div>
  );
}
