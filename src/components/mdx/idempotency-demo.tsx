"use client";

import { useRef, useState } from "react";

type Log = { id: number; text: string; duplicate: boolean };

export function IdempotencyDemo() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [processed, setProcessed] = useState(0);
  const [running, setRunning] = useState(false);
  const nextId = useRef(0);

  async function send(useKey: boolean) {
    setLogs([]);
    setProcessed(0);
    setRunning(true);
    const sharedKey = crypto.randomUUID();
    const stored = new Set<string>();

    await Promise.all(
      Array.from({ length: 5 }, async (_, index) => {
        await new Promise((resolve) => setTimeout(resolve, 120 + index * 90));
        const key = useKey ? sharedKey : crypto.randomUUID();
        const duplicate = stored.has(key);
        stored.add(key);
        if (!duplicate) setProcessed((value) => value + 1);
        setLogs((current) => [
          ...current,
          {
            id: ++nextId.current,
            text: `${index + 1}번째 요청: ${duplicate ? "저장된 응답 재사용" : "결제 처리"}`,
            duplicate,
          },
        ]);
      }),
    );
    setRunning(false);
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={running} onClick={() => send(false)} className="rounded-md border border-black/15 px-3 py-1.5 hover:bg-foreground/[0.06] disabled:opacity-50 dark:border-white/20">
          키 없이 5번 전송
        </button>
        <button type="button" disabled={running} onClick={() => send(true)} className="rounded-md bg-foreground px-3 py-1.5 text-background disabled:opacity-50">
          같은 키로 5번 전송
        </button>
      </div>
      <div className="rounded-md bg-foreground/[0.05] px-3 py-2">
        서버에서 실제 처리한 횟수: <b className="font-mono">{processed}</b>
      </div>
      <ol className="min-h-28 space-y-1 text-xs text-foreground/65">
        {logs.map((log) => (
          <li key={log.id} className={log.duplicate ? "text-blue-600 dark:text-blue-400" : ""}>
            {log.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
