import { NextResponse } from "next/server";
import { search } from "@/lib/search";

const MAX_QUERY_LENGTH = 50;

export async function GET(req: Request) {
  const query = (new URL(req.url).searchParams.get("q") ?? "").trim();

  if (query.length === 0) {
    return NextResponse.json({ query, results: [] });
  }
  // 서버는 클라이언트를 믿지 않는다 — 길이 제한을 여기서도 다시 건다.
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `검색어는 ${MAX_QUERY_LENGTH}자 이하로 입력해 주세요` },
      { status: 400 },
    );
  }

  try {
    const results = search(query);
    return NextResponse.json({ query, results });
  } catch {
    return NextResponse.json({ error: "검색에 실패했습니다" }, { status: 500 });
  }
}
