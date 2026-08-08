"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // 하루 1회만 증가: localStorage에 "마지막으로 센 날짜"를 저장.
    // 같은 날 재방문·새로고침은 읽기만, 날짜가 바뀌면 다시 카운트.
    const key = `viewed:${slug}`;
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD (로컬 기준)
    let countedToday = false;
    try {
      countedToday = localStorage.getItem(key) === today;
      if (!countedToday) localStorage.setItem(key, today);
    } catch {}

    fetch(`/api/views/${slug}`, { method: countedToday ? "GET" : "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.views === "number") setViews(d.views);
      })
      .catch(() => {});
  }, [slug]);

  // 저장소 미설정이거나 로딩 중이면 아무것도 표시하지 않음
  if (views == null) return null;

  return (
    <>
      <span aria-hidden>·</span>
      <span>조회 {views.toLocaleString()}</span>
    </>
  );
}
