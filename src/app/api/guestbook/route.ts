import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "guestbook";
const MAX_ENTRIES = 100; // 보관 최대 개수
const PAGE = 50; // 한 번에 내려줄 개수
const RATE_SECONDS = 30; // IP당 작성 간격

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  at: number;
};

// 방명록 목록 (최신순)
export async function GET() {
  if (!redis) return NextResponse.json({ entries: [] });
  try {
    // Upstash SDK는 객체를 JSON으로 자동 직렬화/역직렬화한다
    const entries = await redis.lrange<GuestbookEntry>(KEY, 0, PAGE - 1);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}

// 방명록 작성
export async function POST(req: Request) {
  if (!redis)
    return NextResponse.json({ error: "방명록이 비활성화되어 있습니다" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = String(b?.name ?? "").trim();
  const message = String(b?.message ?? "").trim();

  // 입력 검증
  if (name.length < 1 || name.length > 20)
    return NextResponse.json({ error: "이름은 1~20자여야 합니다" }, { status: 400 });
  if (message.length < 1 || message.length > 200)
    return NextResponse.json({ error: "메시지는 1~200자여야 합니다" }, { status: 400 });

  // 레이트 리밋: 같은 IP는 30초에 한 번만 (SET NX EX)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    const ok = await redis.set(`rl:guestbook:${ip}`, "1", {
      nx: true,
      ex: RATE_SECONDS,
    });
    if (ok === null)
      return NextResponse.json(
        { error: "너무 자주 남기고 있어요. 잠시 후 다시 시도해 주세요" },
        { status: 429 },
      );
  } catch {
    // 레이트 리밋 실패는 작성 자체를 막지 않는다
  }

  const entry: GuestbookEntry = {
    id: crypto.randomUUID(),
    name,
    message,
    at: Date.now(),
  };

  try {
    await redis.lpush(KEY, entry); // 최신이 앞
    await redis.ltrim(KEY, 0, MAX_ENTRIES - 1); // 오래된 것부터 버림
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "저장에 실패했습니다" }, { status: 500 });
  }
}
