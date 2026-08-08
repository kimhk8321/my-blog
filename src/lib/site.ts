export const siteConfig = {
  name: "김형기의 기술 블로그",
  title: "김형기의 기술 블로그",
  description:
    "프론트엔드를 중심으로 CS·개발 경험까지 정리하는 기술 블로그입니다.",
  author: {
    name: "김형기",
    email: "kimhk8321@gmail.com",
  },
  locale: "ko_KR",
} as const;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://my-blog-self-alpha.vercel.app"
).replace(/\/$/, "");
