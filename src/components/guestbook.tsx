"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; name: string; message: string; at: number };

function timeAgo(at: number) {
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return new Date(at).toLocaleDateString("ko-KR");
}

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "작성에 실패했습니다");
        setStatus("error");
        return;
      }
      setEntries((prev) => [data.entry, ...prev]); // 낙관적 반영
      setName("");
      setMessage("");
      setStatus("idle");
    } catch {
      setError("네트워크 오류");
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15"
      >
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            maxLength={20}
            className="w-32 rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="한마디 남겨 주세요 (최대 200자)"
            maxLength={200}
            className="min-w-0 flex-1 rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-red-500">{error}</span>
          <button
            type="submit"
            disabled={status === "sending" || !name.trim() || !message.trim()}
            className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-600 disabled:opacity-40"
          >
            {status === "sending" ? "남기는 중…" : "남기기"}
          </button>
        </div>
      </form>

      <ul className="flex flex-col gap-3">
        {!loaded && <li className="text-sm text-foreground/40">불러오는 중…</li>}
        {loaded && entries.length === 0 && (
          <li className="text-sm text-foreground/40">
            아직 방명록이 없습니다. 첫 글을 남겨보세요!
          </li>
        )}
        {entries.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
          >
            <div className="flex items-baseline justify-between gap-2">
              {/* React가 텍스트를 자동 이스케이프 → XSS 안전 */}
              <span className="font-semibold">{e.name}</span>
              <span className="shrink-0 text-xs text-foreground/40">
                {timeAgo(e.at)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/80">
              {e.message}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
