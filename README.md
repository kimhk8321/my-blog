# 프론트엔드 기술 블로그

Next.js(App Router) 기반의 개인 기술 블로그입니다. 마크다운(MDX)으로 글을 작성하면 목록/상세 페이지가 자동 생성되고, 공유에 필요한 OG 이미지·sitemap·robots·RSS가 함께 만들어집니다.

## AI 활용에 대하여

이 블로그는 **공부를 목적으로** 직접 만들고 운영합니다. 개발과 글 정리 과정에서 **AI(Claude / Claude Code)** 를 적극적으로 활용하고 있습니다.

"대신 만들어 달라"기보다는 모르는 것을 묻고, 설계를 함께 따져 보고, 구현한 뒤 직접 확인하는 방식에 가깝습니다. 검색·관련 글 추천·방명록·조회수처럼 이 블로그에 붙인 기능들도 그렇게 만들었고, 그 과정에서 겪은 문제와 배운 것은 `posts/`에 글로 남기고 있습니다.

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
