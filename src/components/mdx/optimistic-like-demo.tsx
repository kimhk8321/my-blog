"use client";

import { useOptimistic, useState, useTransition } from "react";

export function OptimisticLikeDemo() {
  const [likes, setLikes] = useState(0);
  const [optimisticLikes, addOptimistic] = useOptimistic(
    likes,
    (cur, delta: number) => cur + delta,
  );
  const [isPending, startTransition] = useTransition();
  const [failMode, setFailMode] = useState(false);

  const like = () => {
    startTransition(async () => {
      addOptimistic(1); // 즉시 반영(낙관적)
      await new Promise((r) => setTimeout(r, 900)); // 서버 요청 흉내
      if (!failMode) {
        setLikes((l) => l + 1); // 성공 → 실제 상태 커밋
      }
      // 실패면 아무것도 안 함 → 트랜잭션이 끝나며 optimistic 값이 롤백됨
    });
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md border border-black/15 px-3 py-1.5 transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
          onClick={like}
        >
          ❤️ 좋아요
        </button>
        <span>
          <b className="font-mono text-lg">{optimisticLikes}</b>
          {isPending && (
            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
              저장 중…
            </span>
          )}
        </span>
      </div>

      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={failMode}
          onChange={(e) => setFailMode(e.target.checked)}
        />
        서버 실패 시뮬레이션 (켜면 롤백됨)
      </label>

      <p className="text-xs text-foreground/50">
        누르면 숫자가 <b>즉시</b> 오르고, 900ms 뒤 서버 응답에 따라 확정되거나
        <b> 롤백</b>됩니다. 실패 모드를 켜고 눌러 보세요.
      </p>
    </div>
  );
}
