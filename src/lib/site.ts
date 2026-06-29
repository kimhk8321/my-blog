export const siteConfig = {
  name: "Frontend Dev Blog",
  title: "프론트엔드 기술 블로그",
  description:
    "프론트엔드 개발과 관련된 학습 기록과 경험을 정리하는 기술 블로그입니다.",
  author: {
    name: "hyeonggi",
    email: "kimhk8321@gmail.com",
  },
  locale: "ko_KR",
} as const;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
