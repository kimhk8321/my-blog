import type { Post } from "@/lib/posts";

/** 검색·추천 테스트용 가짜 글 — 닮은 두 편과 상관없는 두 편. */
export const fixturePosts: Post[] = [
  {
    slug: "react-hooks",
    title: "React 훅으로 상태 관리하기",
    description: "컴포넌트 안에서 상태를 다루는 훅 이야기",
    date: "2026-09-04",
    category: "react",
    tags: ["React", "훅"],
    draft: false,
    migrated: false,
    content: `
훅은 컴포넌트가 상태를 기억하게 해 준다. 상태가 바뀌면 컴포넌트는 다시 렌더링된다.
useState 훅은 상태와 상태를 바꾸는 함수를 함께 돌려준다. 렌더링 사이에 값을 유지하는 것이 훅의 핵심이다.
컴포넌트가 다시 렌더링돼도 훅의 순서는 그대로여야 한다. 그래서 훅을 조건문 안에서 부르면 안 된다.
상태 관리가 복잡해지면 useReducer 훅으로 상태 변경 규칙을 한곳에 모은다.
`,
  },
  {
    slug: "react-store",
    title: "React 상태 관리 라이브러리 만들기",
    description: "컴포넌트 바깥에 상태를 두고 렌더링을 구독하는 저장소",
    date: "2026-09-03",
    category: "react",
    tags: ["React", "상태 관리"],
    draft: false,
    migrated: false,
    content: `
컴포넌트 바깥에 상태를 두면 여러 컴포넌트가 같은 상태를 본다.
저장소는 상태를 들고 있다가 상태가 바뀌면 구독한 컴포넌트에게 알려 다시 렌더링하게 한다.
훅으로 이 저장소를 감싸면 컴포넌트 쪽 코드는 useState를 쓰던 때와 비슷해진다.
상태 관리 라이브러리가 하는 일이 결국 이 구독과 렌더링이다.
`,
  },
  {
    slug: "mysql-index",
    title: "MySQL 인덱스와 실행 계획",
    description: "느린 쿼리를 인덱스로 고치기",
    date: "2026-09-02",
    category: "backend",
    tags: ["MySQL", "인덱스"],
    draft: false,
    migrated: false,
    content: `
인덱스는 테이블 전체를 훑지 않고 원하는 행으로 바로 가게 해 준다.
실행 계획을 보면 옵티마이저가 어떤 인덱스를 골랐는지 알 수 있다.
정렬과 조건이 인덱스 순서와 어긋나면 인덱스를 타지 못하고 풀 스캔이 일어난다.
쿼리가 느리면 먼저 실행 계획부터 확인한다.
`,
  },
  {
    slug: "css-grid",
    title: "CSS 그리드 레이아웃",
    description: "격자로 화면을 나누는 방법",
    date: "2026-09-01",
    category: "css",
    tags: ["CSS", "그리드"],
    draft: false,
    migrated: false,
    content: `
그리드는 가로줄과 세로줄로 화면을 나눈다. 칸의 크기는 fr 단위로 비율을 준다.
플렉스가 한 방향을 다룬다면 그리드는 두 방향을 한꺼번에 다룬다.
영역에 이름을 붙이면 레이아웃을 글자로 그릴 수 있다.
`,
  },
];
