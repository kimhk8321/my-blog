"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Entry = { id: string; name: string; message: string; at: number };

export function AdminGuestbook() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const remove = async (id: string) => {
    if (busy) return;
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "삭제에 실패했습니다");
        setBusy(null);
        return;
      }
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch {
      setError("네트워크 오류");
    }
    setBusy(null);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-foreground/60">
          방명록 {loaded ? `${entries.length}개` : "불러오는 중…"}
        </p>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-black/10 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:text-foreground dark:border-white/15"
        >
          로그아웃
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="flex flex-col gap-3">
        {loaded && entries.length === 0 && (
          <li className="text-sm text-foreground/40">방명록이 비어 있습니다.</li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{entry.name}</span>
                <span className="text-xs text-foreground/40">
                  {new Date(entry.at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/80">
                {entry.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(entry.id)}
              disabled={busy === entry.id}
              className="shrink-0 rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
            >
              {busy === entry.id ? "삭제 중…" : "삭제"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
