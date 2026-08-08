import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getAllPostSlugs } from "@/lib/posts";

function isValidSlug(slug: string) {
  return getAllPostSlugs().includes(slug); // 임의 키 생성 방지
}

// 조회수 읽기 (증가 없음)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!redis || !isValidSlug(slug)) return NextResponse.json({ views: null });
  try {
    const views = (await redis.get<number>(`views:${slug}`)) ?? 0;
    return NextResponse.json({ views });
  } catch {
    return NextResponse.json({ views: null }); // Redis 오류 시 조용히 비활성화
  }
}

// 조회수 1 증가
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!redis || !isValidSlug(slug)) return NextResponse.json({ views: null });
  try {
    const views = await redis.incr(`views:${slug}`);
    return NextResponse.json({ views });
  } catch {
    return NextResponse.json({ views: null });
  }
}
