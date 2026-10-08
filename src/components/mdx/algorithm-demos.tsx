"use client";

import { useId, useState } from "react";

const buttonClass = "rounded-md border border-black/15 px-3 py-1.5 hover:bg-foreground/[0.06] disabled:opacity-40 dark:border-white/20";

function StepControls({ step, total, onChange }: { step: number; total: number; onChange: (step: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={buttonClass} disabled={step === 0} onClick={() => onChange(step - 1)}>이전 단계</button>
      <button type="button" className={buttonClass} disabled={step === total - 1} onClick={() => onChange(step + 1)}>다음 단계</button>
      <button type="button" className={buttonClass} disabled={step === 0} onClick={() => onChange(0)}>처음으로</button>
      <span className="text-xs text-foreground/60">{step + 1} / {total}</span>
    </div>
  );
}

const windowValues = [2, 1, 5, 1, 3, 2];
const windowSize = 3;
const windowFrames = Array.from({ length: windowValues.length - windowSize + 1 }, (_, left) => {
  let sum = 0;
  for (let i = left; i < left + windowSize; i++) sum += windowValues[i];
  return { left, sum };
});

export function SlidingWindowDemo() {
  const [step, setStep] = useState(0);
  const frame = windowFrames[step];
  const best = Math.max(...windowFrames.slice(0, step + 1).map((item) => item.sum));

  return (
    <div className="space-y-4 text-sm">
      <p>길이 3인 연속 구간의 최대합을 구합니다.</p>
      <div className="grid grid-cols-6 gap-1.5" aria-label="윈도우 배열">
        {windowValues.map((value, index) => (
          <div key={index} className={`rounded-md py-3 text-center font-mono ${index >= frame.left && index < frame.left + windowSize ? "bg-blue-600 text-white" : "bg-foreground/[0.06]"}`}>
            {value}
            <span className="block text-[10px] opacity-70">i={index}</span>
          </div>
        ))}
      </div>
      <p role="status">구간 [{frame.left}, {frame.left + windowSize - 1}] · 현재 합 {frame.sum} · 지금까지 최대 {best}</p>
      <StepControls step={step} total={windowFrames.length} onChange={setStep} />
    </div>
  );
}

const sortedValues = [1, 2, 2, 2, 4, 6, 7, 8, 9];

function binaryFrames(target: number) {
  let left = 0;
  let right = sortedValues.length;
  const frames: { left: number; right: number; mid: number | null }[] = [];
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    frames.push({ left, right, mid });
    if (sortedValues[mid] >= target) right = mid;
    else left = mid + 1;
  }
  frames.push({ left, right, mid: null });
  return frames;
}

export function BinarySearchDemo() {
  const targetId = useId();
  const [target, setTarget] = useState(2);
  const [step, setStep] = useState(0);
  const frames = binaryFrames(target);
  const frame = frames[step];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3">
        <label htmlFor={targetId}>target</label>
        <select id={targetId} className="rounded-md border border-black/20 bg-background px-3 py-1.5 dark:border-white/20" value={target} onChange={(event) => { setTarget(Number(event.target.value)); setStep(0); }}>
          {[0, 2, 4, 10].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-9 gap-1" aria-label="이분 탐색 배열">
        {sortedValues.map((value, index) => (
          <div key={index} className={`rounded py-3 text-center font-mono ${index === frame.mid ? "bg-blue-600 text-white" : index >= frame.left && index < frame.right ? "bg-foreground/[0.08]" : "bg-foreground/[0.03] text-foreground/35"}`}>
            {value}
            <span className="block text-[10px] opacity-70">{index}</span>
          </div>
        ))}
      </div>
      <p role="status">
        {frame.mid === null ? `탐색 완료 · lower bound 인덱스 ${frame.left}` : `left=${frame.left} · mid=${frame.mid} · right=${frame.right} · ${sortedValues[frame.mid]} ${sortedValues[frame.mid] >= target ? "≥" : "<"} ${target}`}
      </p>
      <StepControls step={step} total={frames.length} onChange={setStep} />
    </div>
  );
}

const grid = [
  [0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
];

function bfsFrames() {
  const distance = grid.map((row) => row.map(() => -1));
  const queue: [number, number][] = [[0, 0]];
  let head = 0;
  distance[0][0] = 0;
  const snapshot = (active: [number, number] | null, done: boolean) => ({
    distance: distance.map((row) => [...row]),
    pending: queue.slice(head).map(([r, c]) => `${r},${c}`),
    active,
    done,
  });
  const frames = [snapshot(null, false)];
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if (r === grid.length - 1 && c === grid[0].length - 1) {
      frames.push(snapshot([r, c], true));
      break;
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) continue;
      if (grid[nr][nc] === 1 || distance[nr][nc] !== -1) continue;
      distance[nr][nc] = distance[r][c] + 1;
      queue.push([nr, nc]);
    }
    frames.push(snapshot([r, c], false));
  }
  return frames;
}

const gridFrames = bfsFrames();

export function BfsGridDemo() {
  const [step, setStep] = useState(0);
  const frame = gridFrames[step];

  return (
    <div className="space-y-4 text-sm">
      <p>파랑: 큐 대기 · 초록: 이번에 처리 · 회색: 벽 · 숫자: 거리</p>
      <div className="grid max-w-sm grid-cols-5 gap-1.5" aria-label="BFS 격자">
        {grid.flatMap((row, r) => row.map((wall, c) => {
          const active = frame.active?.[0] === r && frame.active?.[1] === c;
          const pending = frame.pending.includes(`${r},${c}`);
          const color = wall ? "bg-slate-500 text-white" : active ? "bg-green-700 text-white" : pending ? "bg-blue-600 text-white" : "bg-foreground/[0.06]";
          const name = r === 0 && c === 0 ? "시작" : r === grid.length - 1 && c === row.length - 1 ? "도착" : `${r},${c}`;
          return (
            <div key={`${r},${c}`} aria-label={`${name}: ${wall ? "벽" : `거리 ${frame.distance[r][c]}`}`} className={`rounded-md py-2 text-center font-mono ${color}`}>
              {wall ? "×" : frame.distance[r][c] === -1 ? "·" : frame.distance[r][c]}
              <span className="block text-[10px] opacity-75">{name}</span>
            </div>
          );
        }))}
      </div>
      <p role="status">{frame.done ? `도착 · 최소 이동 ${frame.distance[grid.length - 1][grid[0].length - 1]}회` : `큐: ${frame.pending.length > 0 ? frame.pending.map((point) => `(${point})`).join(" → ") : "비어 있음"}`}</p>
      <StepControls step={step} total={gridFrames.length} onChange={setStep} />
    </div>
  );
}
