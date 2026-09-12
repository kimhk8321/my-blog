function normalize(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}

/** 같은 것을 다르게 적은 태그들. 왼쪽(별칭)을 오른쪽(대표 표기)으로 합친다. */
const TAG_ALIASES: Record<string, string> = {
  a11y: "접근성",
  i18n: "국제화",
  oop: "객체지향",
  타입스크립트: "TypeScript",
  "가상 dom": "Virtual DOM",
  정규식: "정규표현식",
  "웹 성능": "성능",
  "성능 최적화": "성능",
  "web vitals": "Core Web Vitals",
  "tanstack query": "React Query",
  rest: "REST API",
  번들링: "번들러",
  "빌드 최적화": "빌드",
  "코드 품질": "클린 코드",
  리렌더: "렌더링",
  멀티스레딩: "스레드",
  "모듈 시스템": "모듈",
  "서버 컴포넌트": "RSC",
  "웹 보안": "보안",
  "big-o": "시간복잡도",
  "타입 가드": "타입 좁히기",
  모킹: "테스트 더블",
  "실행 계획": "EXPLAIN",
  워크스페이스: "Monorepo",
  "route.ts": "Route Handlers",
};

/** 합쳐진 태그의 화면 표기. */
const CANONICAL_SPELLING = new Map(
  Object.values(TAG_ALIASES).map((tag) => [normalize(tag), tag]),
);

export function tagKey(tag: string): string {
  const key = normalize(tag);
  const canonical = TAG_ALIASES[key];
  return canonical ? normalize(canonical) : key;
}

/** 별칭으로 들어온 태그를 대표 표기로 바꾼다. */
export function canonicalTag(tag: string): string {
  return CANONICAL_SPELLING.get(tagKey(tag)) ?? tag.trim();
}

export interface TagCount {
  tag: string;
  count: number;
}

/** 같은 키의 태그를 하나로 합쳐 개수와 함께 돌려준다. */
export function collectTags(tagLists: (string[] | undefined)[]): TagCount[] {
  const groups = new Map<string, Map<string, number>>();

  for (const tags of tagLists) {
    const seen = new Set<string>();
    for (const raw of tags ?? []) {
      const tag = raw.trim();
      if (!tag) continue;
      const key = tagKey(tag);
      if (seen.has(key)) continue;
      seen.add(key);

      const spellings = groups.get(key) ?? new Map<string, number>();
      spellings.set(tag, (spellings.get(tag) ?? 0) + 1);
      groups.set(key, spellings);
    }
  }

  return [...groups.entries()]
    .map(([key, spellings]) => {
      const sorted = [...spellings.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"),
      );
      const count = sorted.reduce((sum, [, n]) => sum + n, 0);
      return { tag: CANONICAL_SPELLING.get(key) ?? sorted[0][0], count };
    })
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ko"));
}
