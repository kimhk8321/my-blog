"use client";

import { useState } from "react";

const ROW_H = 32; // 행 높이(px)
const VIEW_H = 240; // 스크롤 영역 높이(px)
const TOTAL = 10000; // 전체 행 수
const OVERSCAN = 4; // 위아래 여유 행

export function VirtualListDemo() {
  const [scrollTop, setScrollTop] = useState(0);

  // 현재 스크롤 위치로 "보이는 구간"만 계산
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const end = Math.min(TOTAL, Math.ceil((scrollTop + VIEW_H) / ROW_H) + OVERSCAN);

  const rows: number[] = [];
  for (let i = start; i < end; i++) rows.push(i);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="text-xs text-foreground/60">
        총 <b>{TOTAL.toLocaleString()}</b>행 · 실제 DOM에 그려진 행:{" "}
        <b className="font-mono">{rows.length}</b>개
      </div>

      <div
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: VIEW_H, overflow: "auto" }}
        className="rounded-md border border-black/10 dark:border-white/15"
      >
        {/* 전체 높이만큼 공간을 확보해 스크롤바를 만든다 */}
        <div style={{ height: TOTAL * ROW_H, position: "relative" }}>
          {rows.map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: i * ROW_H,
                left: 0,
                right: 0,
                height: ROW_H,
              }}
              className="flex items-center border-b border-black/5 px-3 font-mono text-xs dark:border-white/10"
            >
              Row #{i}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-foreground/50">
        스크롤해 보세요 — 1만 행이지만 DOM에는 화면에 보이는 십여 개만
        존재합니다.
      </p>
    </div>
  );
}
