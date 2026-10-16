import type { Metadata } from "next";
import Link from "next/link";
import { AdminLogin } from "@/components/admin-login";
import { AdminGuestbook } from "@/components/admin-guestbook";
import { isAdmin, isAdminEnabled } from "@/lib/admin";

// 쿠키를 봐야 하므로 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리",
  robots: { index: false, follow: false }, // 검색에 노출되지 않게
};

export default async function AdminPage() {
  const enabled = isAdminEnabled();
  // 세션 확인은 서버에서 한다. 로그인 화면이 잠깐 스쳐 보이지 않는다.
  const authed = enabled && (await isAdmin());

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">관리</h1>

      {!enabled ? (
        <p className="mt-6 text-sm text-foreground/60">
          관리자 기능이 꺼져 있습니다. 환경변수 <code>ADMIN_PASSWORD</code>와 저장소
          설정이 필요합니다.
        </p>
      ) : authed ? (
        <div className="mt-8 space-y-8">
          <Link href="/admin/interview" prefetch={false} className="block rounded-lg border border-black/10 p-5 transition-colors hover:bg-foreground/[0.03] dark:border-white/15">
            <h2 className="font-semibold">면접 준비</h2>
            <p className="mt-1 text-sm text-foreground/60">관리자만 읽을 수 있는 학습 글을 모았습니다.</p>
          </Link>
          <AdminGuestbook />
        </div>
      ) : (
        <div className="mt-8">
          <AdminLogin />
        </div>
      )}
    </div>
  );
}
