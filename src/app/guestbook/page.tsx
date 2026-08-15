import type { Metadata } from "next";
import { Guestbook } from "@/components/guestbook";

export const metadata: Metadata = {
  title: "방명록",
  description:
    "블로그에 직접 구현한 방명록입니다. 자유롭게 한마디 남겨 주세요.",
};

export default function GuestbookPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">방명록</h1>
        <p className="mt-2 text-sm text-foreground/70">
          블로그에 직접 만든 백엔드(방명록)입니다. 자유롭게 한마디 남겨 주세요.
          만든 과정은{" "}
          <a href="/posts/guestbook-backend" className="underline">
            이 글
          </a>
          에 정리했습니다.
        </p>
      </div>
      <Guestbook />
    </div>
  );
}
