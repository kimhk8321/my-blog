import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "면접 준비",
  description: "관리자 전용 학습 공간",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  alternates: { canonical: null, types: {} },
  openGraph: { title: "면접 준비", description: "관리자 전용 학습 공간", images: [] },
  twitter: { title: "면접 준비", description: "관리자 전용 학습 공간", images: [] },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
