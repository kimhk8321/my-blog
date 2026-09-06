import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession, isAdminEnabled } from "@/lib/admin";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  // 쿠키만 지우면 토큰은 저장소에 남는다. 서버에서도 함께 없앤다.
  if (token && isAdminEnabled()) {
    try {
      await destroySession(token);
    } catch {}
  }

  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
