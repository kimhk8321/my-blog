"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다");
        setSending(false);
        return;
      }
      setPassword("");
      router.refresh(); // 서버에서 세션을 다시 확인하게 한다
    } catch {
      setError("네트워크 오류");
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex max-w-sm flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15"
    >
      <label htmlFor="admin-password" className="text-sm text-foreground/70">
        관리자 비밀번호
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-red-500">{error}</span>
        <button
          type="submit"
          disabled={sending || password.length === 0}
          className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-600 disabled:opacity-40"
        >
          {sending ? "확인 중…" : "로그인"}
        </button>
      </div>
    </form>
  );
}
