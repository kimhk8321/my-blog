# 프론트엔드 기술 블로그

Next.js(App Router) 기반의 개인 기술 블로그입니다. 마크다운(MDX)으로 글을 작성하면 목록/상세 페이지가 자동 생성되고, 공유에 필요한 OG 이미지·sitemap·robots·RSS가 함께 만들어집니다.

## 기술 스택

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** + `@tailwindcss/typography`
- **MDX** 렌더링: `next-mdx-remote`, `gray-matter`, `remark-gfm`, `rehype-highlight`, `rehype-slug`
- **RSS**: `feed`

## 개발

```bash
npm run dev      # 개발 서버 (기본 3000, 사용 중이면 자동으로 다음 포트)
npm run build    # 프로덕션 빌드 (모든 글을 정적 생성)
npm run start    # 빌드 결과 실행
```

## 글 작성하기

`posts/` 폴더에 `.mdx`(또는 `.md`) 파일을 추가하면 됩니다. 파일명이 곧 URL slug 입니다.
예) `posts/my-first-post.mdx` → `/posts/my-first-post`

frontmatter 형식:

```markdown
---
title: "글 제목"
description: "검색/공유 시 노출되는 한 줄 설명"
date: "2026-06-26"
tags: ["React", "Next.js"]
draft: false   # true 면 개발 환경에서만 보이고 배포에서는 제외
---

본문을 마크다운/MDX로 작성합니다.
```

## 자동 생성되는 것들

| 경로 | 설명 |
| --- | --- |
| `/` | 글 목록 (최신순) |
| `/posts/[slug]` | 글 상세 |
| `/posts/[slug]/opengraph-image` | 글별 OG 이미지 (1200×630) |
| `/opengraph-image` | 사이트 대표 OG 이미지 |
| `/sitemap.xml` | 사이트맵 |
| `/robots.txt` | 크롤러 규칙 |
| `/feed.xml` | RSS 피드 |

## 설정

`src/lib/site.ts` 에서 블로그 이름·설명·작성자 정보를 수정하세요.
배포 도메인은 환경변수 `NEXT_PUBLIC_SITE_URL` 로 지정합니다(예: `https://blog.example.com`).
지정하지 않으면 `http://localhost:3000` 이 사용됩니다.

## 배포 (Vercel)

1. 이 저장소를 GitHub 에 푸시
2. [vercel.com](https://vercel.com) 에서 GitHub 저장소를 Import
3. 환경변수 `NEXT_PUBLIC_SITE_URL` 에 실제 도메인 입력 후 Deploy
