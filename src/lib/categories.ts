export interface Category {
  id: string;
  label: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "react",
    label: "React",
    description: "모던 리액트, 컴포넌트 설계, 훅 등 React 핵심 정리",
  },
  {
    id: "javascript",
    label: "JavaScript",
    description: "모던 자바스크립트 Deep Dive 기반 JS 기초·심화",
  },
  {
    id: "typescript",
    label: "TypeScript",
    description: "타입 시스템과 실전 타입스크립트 활용",
  },
  {
    id: "state-management",
    label: "상태관리",
    description: "Redux, MobX, Context API, React Query",
  },
  {
    id: "styling",
    label: "스타일링",
    description: "Tailwind, styled-components, CSS/SCSS/SASS",
  },
  {
    id: "build-tools",
    label: "개발환경·빌드",
    description: "Vite, webpack, ESLint, Prettier, 모노레포, 패키지 매니저",
  },
  {
    id: "testing",
    label: "테스트",
    description: "Jest, Vitest, Storybook",
  },
  {
    id: "performance",
    label: "성능 최적화",
    description: "렌더링·번들·런타임 성능 최적화 기록",
  },
  {
    id: "architecture",
    label: "아키텍처",
    description: "디자인 패턴, SSR, BFF",
  },
  {
    id: "infra",
    label: "인프라·배포",
    description: "CI/CD, Docker, Kubernetes",
  },
  {
    id: "network",
    label: "네트워크",
    description: "HTTP, 웹소켓 등 네트워크 기초",
  },
  {
    id: "react-native",
    label: "React Native",
    description: "React Native 앱 개발 기록",
  },
  {
    id: "cs",
    label: "CS",
    description: "컴퓨터 과학, 알고리즘, 웹 서버 아키텍처",
  },
  {
    id: "retrospect",
    label: "회고·프로젝트",
    description: "사이드 프로젝트와 회고, 블로그 운영",
  },
];

const categoryIds = new Set(categories.map((c) => c.id));

export function isValidCategory(id: string): boolean {
  return categoryIds.has(id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
