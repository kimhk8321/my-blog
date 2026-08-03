"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number };

export function ParticleCanvasDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const N = 55;
    let W = 0, H = 0;
    let parts: Particle[] | null = null;

    let raf = 0;
    const loop = () => {
      // 매 프레임 크기를 확인 — 레이아웃이 확정되는 첫 프레임에 버퍼를 맞춘다
      const r = canvas.getBoundingClientRect();
      if (r.width > 0 && (r.width !== W || r.height !== H)) {
        W = r.width;
        H = r.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!parts) {
          parts = Array.from({ length: N }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
          }));
        }
      }
      if (!parts) {
        raf = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 90 && dist > 0) {
          p.vx += (dx / dist) * 0.4;
          p.vy += (dy / dist) * 0.4;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.x = Math.max(0, Math.min(W, p.x));
        p.y = Math.max(0, Math.min(H, p.y));
        ctx.fillStyle = "rgba(99,102,241,0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = parts[i], b = parts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 75) {
            ctx.strokeStyle = `rgba(99,102,241,${1 - d / 75})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (mouse.current = { x: -999, y: -999 });
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <canvas
        ref={canvasRef}
        className="h-56 w-full touch-none rounded-md border border-black/10 bg-foreground/[0.03] dark:border-white/15"
      />
      <p className="text-xs text-foreground/50">
        캔버스 위에서 마우스를 움직이면 파티클이 밀려납니다. 가까운 점끼리는
        선으로 이어집니다.
      </p>
    </div>
  );
}
