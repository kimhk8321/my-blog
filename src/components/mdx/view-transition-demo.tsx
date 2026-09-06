"use client";

import { useState, useSyncExternalStore } from "react";

const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
];

export function ViewTransitionDemo() {
  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5]);
  // 브라우저 지원 여부는 React 밖의 사실이라 구독할 게 없다.
  // 서버에서는 true로 그리고(경고를 미리 띄우지 않게), 클라이언트에서 실제로 확인한다.
  const supported = useSyncExternalStore(
    () => () => {},
    () => "startViewTransition" in document,
    () => true,
  );

  const shuffle = () => {
    const next = [...order].sort(() => Math.random() - 0.5);
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (doc.startViewTransition) {
      doc.startViewTransition(() => setOrder(next));
    } else {
      setOrder(next);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <button
        className="w-fit rounded-md border border-black/15 px-3 py-1.5 transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
        onClick={shuffle}
      >
        섞기
      </button>

      <div className="flex flex-wrap gap-2">
        {order.map((n) => (
          <div
            key={n}
            style={{ viewTransitionName: `vt-box-${n}` }}
            className={`flex h-12 w-12 items-center justify-center rounded-md text-white ${colors[n]}`}
          >
            {n}
          </div>
        ))}
      </div>

      <p className="text-xs text-foreground/50">
        {supported
          ? "섞기를 누르면 각 박스가 새 위치로 부드럽게 이동합니다(View Transitions)."
          : "이 브라우저는 View Transitions를 지원하지 않아 애니메이션 없이 바뀝니다."}
      </p>
    </div>
  );
}
