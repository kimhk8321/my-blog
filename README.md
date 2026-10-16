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

## 비공개 면접 글

`/admin`에서 기존 관리자 비밀번호로 로그인한 뒤 **면접 준비**로 이동합니다. 관리자일 때만 좌측 카테고리와 모바일 메뉴에도 진입 링크가 표시됩니다.

비공개 본문은 공개 글과 분리해 Redis에 저장합니다. 원고는 `.private/interview/`의 `.md` 파일로 관리하며, 이 폴더는 Git과 Vercel 업로드에서 제외됩니다. 원고를 `posts/`나 `public/`로 옮기지 마세요. 로컬 원고는 Git으로 백업되지 않으므로 별도로 보관해야 합니다.

원고 frontmatter에는 `title`, `description`, `date`(따옴표로 감싼 YYYY-MM-DD), `topic`, `order`(1 이상)가 필요합니다. 파일명은 영문 소문자·숫자·하이픈으로 작성합니다. 본문은 신뢰할 수 있는 운영자가 작성한 마크다운만 사용합니다.

개인 경험처럼 공개하지 않을 글에는 `privateOnly: true`를 지정합니다. 관리자 목록에서 마지막에 배치되며 **공개 제외**로 표시됩니다. 현재 모든 면접 글은 관리자 전용이고, 이후 공개 기능을 만들 때도 이 항목은 공개 대상에서 제외해야 합니다.

```bash
pnpm interview:import                   # 원고 형식 검증
pnpm interview:import --write           # 새 글만 Redis에 저장
pnpm interview:import --write --replace # 로컬 원고에 해당하는 기존 글도 갱신
```

명령은 `.env.local`의 Redis 설정을 사용합니다. 배포 환경에도 같은 저장소와 `ADMIN_PASSWORD`를 설정해야 합니다. 저장 명령은 기존 글을 자동 삭제하지 않습니다.

비공개 페이지는 요청마다 서버에서 세션을 확인하며 공개 검색·추천·피드·사이트맵·OG 이미지 생성 대상에 포함되지 않습니다. 접근 거절과 저장소 오류가 발생하면 본문을 반환하지 않습니다. 확인용 테스트에는 실제 원고 대신 가상 데이터를 사용합니다.

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
