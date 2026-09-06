import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import {
  SESSION_COOKIE,
  createSession,
  isAdminEnabled,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/admin";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 300;

export async function POST(req: Request) {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: "관리자 기능이 꺼져 있습니다" }, { status: 503 });
  }

  // 비밀번호 하나뿐이라 무차별 대입에 특히 취약하다. 시도 횟수를 제한한다.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const attemptKey = `rl:admin-login:${ip}`;
  try {
    const attempts = await redis!.incr(attemptKey);
    if (attempts === 1) await redis!.expire(attemptKey, WINDOW_SECONDS);
    if (attempts > MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요" },
        { status: 429 },
      );
    }
  } catch {
    // 카운터 실패가 로그인 자체를 막지는 않게 둔다
  }

  let password = "";
  try {
    const body = (await req.json()) as Record<string, unknown>;
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    // 무엇이 틀렸는지 알려주지 않는다
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
  }

  const token = await createSession();
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  try {
    await redis!.del(attemptKey); // 성공했으니 시도 횟수 초기화
  } catch {}

  return NextResponse.json({ ok: true });
}
