"use client";

import { useEffect, useRef, useState } from "react";

const btn =
  "rounded-md border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20";

export function FocusTrapModalDemo() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus(); // 닫힐 때 포커스를 연 버튼으로 되돌림
  };

  useEffect(() => {
    if (!open) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusables = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      // 경계에서 반대편으로 순환시켜 포커스를 가둔다
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    modal.addEventListener("keydown", onKey);
    return () => modal.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative min-h-[340px] rounded-md border border-black/10 p-4 dark:border-white/15">
      <button ref={triggerRef} className={btn} onClick={() => setOpen(true)}>
        모달 열기
      </button>

      {open && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40"
          onClick={close}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ftm-title"
            className="w-64 rounded-lg bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="ftm-title" className="mb-2 font-semibold">
              뉴스레터 구독
            </h3>
            <input
              placeholder="이메일"
              className="mb-3 w-full rounded-md border border-black/15 px-2 py-1 text-sm dark:border-white/20"
            />
            <div className="flex justify-end gap-2">
              <button className={btn} onClick={close}>
                취소
              </button>
              <button className={btn} onClick={close}>
                구독
              </button>
            </div>
            <p className="mt-3 text-xs text-foreground/50">
              Tab을 눌러 보세요 — 포커스가 이 안에서만 순환합니다. Esc로 닫히고,
              포커스는 &lsquo;모달 열기&rsquo; 버튼으로 돌아갑니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
