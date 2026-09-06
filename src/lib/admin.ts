import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

export const SESSION_COOKIE = "admin_session";
const SESSION_PREFIX = "admin:session:";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7일

/** 관리자 비밀번호가 설정돼 있어야만 관리자 기능이 켜진다. */
export function isAdminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && redis);
}

/**
 * 길이가 다르면 비교 시간도 달라져 힌트가 새어 나간다.
 * 먼저 해시로 길이를 맞춘 뒤 상수 시간 비교를 한다.
 */
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * 세션은 저장소에 둔다(JWT가 아니라 서버 보관 방식).
 * 그래야 로그아웃으로 즉시 무효화할 수 있다.
 */
export async function createSession(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await redis!.set(SESSION_PREFIX + token, "1", { ex: SESSION_TTL });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await redis!.del(SESSION_PREFIX + token);
}

/** 쿠키의 세션이 저장소에 살아 있는지 확인한다. */
export async function isAdmin(): Promise<boolean> {
  if (!isAdminEnabled()) return false;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    return (await redis!.exists(SESSION_PREFIX + token)) === 1;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true, // 자바스크립트에서 못 읽게 — XSS로 세션을 훔치지 못하도록
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // 외부 사이트에서 온 요청에는 쿠키를 싣지 않음(CSRF 완화)
  path: "/",
  maxAge: SESSION_TTL,
};
