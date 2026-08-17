import { Suspense } from "react";
import type { Metadata } from "next";
import { Search } from "@/components/search";

export const metadata: Metadata = {
  title: "검색",
  description: "제목·태그·본문에서 글을 찾아봅니다.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">검색</h1>
      <p className="mt-2 text-sm text-foreground/60">
        제목·태그·본문을 함께 찾습니다.
      </p>

      <div className="mt-8">
        {/* useSearchParams를 쓰는 클라이언트 컴포넌트라 Suspense로 감싼다 */}
        <Suspense fallback={<div className="h-11 rounded-lg border border-black/10 dark:border-white/15" />}>
          <Search />
        </Suspense>
      </div>
    </div>
  );
}
