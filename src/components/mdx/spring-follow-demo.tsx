"use client";

import { useEffect, useRef, useState } from "react";

export function SpringFollowDemo() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 120, y: 80 });
  const pos = useRef({ x: 120, y: 80 });
  const vel = useRef({ x: 0, y: 0 });
  const params = useRef({ k: 0.1, d: 0.75 });
  const [stiff, setStiff] = useState(0.1);
  const [damp, setDamp] = useState(0.75);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const { k, d } = params.current;
      vel.current.x = (vel.current.x + (target.current.x - pos.current.x) * k) * d;
      vel.current.y = (vel.current.y + (target.current.y - pos.current.y) * k) * d;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;
      if (boxRef.current)
        boxRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const r = areaRef.current!.getBoundingClientRect();
    target.current = { x: e.clientX - r.left - 20, y: e.clientY - r.top - 20 };
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div
        ref={areaRef}
        onPointerMove={onMove}
        className="relative h-56 cursor-crosshair overflow-hidden rounded-md border border-black/10 bg-foreground/[0.03] dark:border-white/15"
      >
        <div
          ref={boxRef}
          style={{ transform: "translate(120px, 80px)" }}
          className="absolute left-0 top-0 h-10 w-10 rounded-lg bg-indigo-500 shadow-lg"
        />
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <label className="flex items-center gap-2">
          강성(k) {stiff.toFixed(2)}
          <input
            type="range" min={0.02} max={0.3} step={0.01} value={stiff}
            onChange={(e) => { const v = +e.target.value; setStiff(v); params.current.k = v; }}
          />
        </label>
        <label className="flex items-center gap-2">
          감쇠(d) {damp.toFixed(2)}
          <input
            type="range" min={0.5} max={0.95} step={0.01} value={damp}
            onChange={(e) => { const v = +e.target.value; setDamp(v); params.current.d = v; }}
          />
        </label>
      </div>

      <p className="text-xs text-foreground/50">
        영역 위에서 마우스를 움직여 보세요. 강성을 높이면 빠르게, 감쇠를 낮추면
        더 탱탱하게(오버슈트) 따라옵니다.
      </p>
    </div>
  );
}
