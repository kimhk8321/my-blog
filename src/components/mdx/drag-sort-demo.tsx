"use client";

import { useRef, useState } from "react";

const ITEM_H = 44;
const GAP = 8;
const ROW = ITEM_H + GAP; // 한 항목이 차지하는 세로 간격

export function DragSortDemo() {
  const [items, setItems] = useState([
    "React",
    "Vue",
    "Svelte",
    "Solid",
    "Angular",
  ]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0); // 끌리는 항목의 실제 Y(px)
  const listRef = useRef<HTMLUListElement | null>(null);
  const grabOffset = useRef(0); // 잡은 지점과 항목 상단의 간격

  const onPointerDown = (e: React.PointerEvent, index: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = listRef.current!.getBoundingClientRect();
    const y = e.clientY - rect.top;
    grabOffset.current = y - index * ROW;
    setDragging(index);
    setDragY(index * ROW);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging === null || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const newY = e.clientY - rect.top - grabOffset.current;
    setDragY(newY);

    // 끌리는 항목이 지금 몇 번째 슬롯 위에 있나
    let hovered = Math.round(newY / ROW);
    hovered = Math.max(0, Math.min(items.length - 1, hovered));

    if (hovered !== dragging) {
      setItems((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragging, 1);
        next.splice(hovered, 0, moved);
        return next;
      });
      setDragging(hovered);
    }
  };

  const stop = () => setDragging(null);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <ul
        ref={listRef}
        className="relative w-56 select-none"
        style={{ height: items.length * ROW }}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        {items.map((item, i) => {
          const isDrag = dragging === i;
          const y = isDrag ? dragY : i * ROW;
          return (
            <li
              key={item}
              onPointerDown={(e) => onPointerDown(e, i)}
              style={{
                height: ITEM_H,
                transform: `translateY(${y}px) scale(${isDrag ? 1.03 : 1})`,
                transition: isDrag
                  ? "none" // 끌리는 항목은 포인터를 즉시 따라감
                  : "transform 200ms cubic-bezier(0.2, 0, 0, 1)", // 나머지는 부드럽게
                zIndex: isDrag ? 10 : 1,
              }}
              className={`absolute inset-x-0 flex cursor-grab items-center gap-2 rounded-md border px-3 ${
                isDrag
                  ? "border-indigo-400 bg-indigo-500/15 shadow-lg"
                  : "border-black/10 bg-foreground/[0.03] dark:border-white/15"
              }`}
            >
              <span className="text-foreground/30">⠿</span>
              {item}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-foreground/50">
        항목을 눌러 위아래로 끌어 보세요. 밀려나는 항목들이 부드럽게
        미끄러집니다.
      </p>
    </div>
  );
}
