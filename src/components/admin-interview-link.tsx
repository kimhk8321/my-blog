"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminInterviewLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let sequence = 0;
    const check = async () => {
      const current = ++sequence;
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store", signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        if (!controller.signal.aborted && current === sequence) setAuthenticated(data?.authenticated === true);
      } catch {
        if (!controller.signal.aborted && current === sequence) setAuthenticated(false);
      }
    };
    void check();
    window.addEventListener("focus", check);
    window.addEventListener("admin-session-changed", check);
    return () => {
      controller.abort();
      window.removeEventListener("focus", check);
      window.removeEventListener("admin-session-changed", check);
    };
  }, [pathname]);

  if (!authenticated) return null;
  return <Link href="/admin/interview" prefetch={false} onClick={onClick} className={className} aria-current={pathname.startsWith("/admin/interview") ? "page" : undefined}>면접 준비</Link>;
}
