import { describe, expect, it } from "vitest";
import { collectTags, tagKey } from "@/lib/tags";

describe("tagKey", () => {
  it("대소문자와 앞뒤 공백을 무시한다", () => {
    expect(tagKey(" Webpack ")).toBe(tagKey("webpack"));
  });

  it("다른 태그까지 같게 만들지는 않는다", () => {
    expect(tagKey("React")).not.toBe(tagKey("React Native"));
  });
});

describe("tagKey — 별칭", () => {
  it("같은 것을 다르게 적은 태그를 한 키로 모은다", () => {
    expect(tagKey("a11y")).toBe(tagKey("접근성"));
    expect(tagKey("타입스크립트")).toBe(tagKey("TypeScript"));
  });

  it("별칭으로 들어온 주소도 대표 태그를 찾아간다", () => {
    expect(tagKey("가상 DOM")).toBe(tagKey("Virtual DOM"));
  });

  it("뜻이 다른 태그는 합치지 않는다", () => {
    expect(tagKey("AbortController")).not.toBe(tagKey("비동기"));
    expect(tagKey("Intl")).not.toBe(tagKey("국제화"));
  });
});

describe("collectTags", () => {
  it("대소문자만 다른 태그를 하나로 합친다", () => {
    const tags = collectTags([["Webpack"], ["webpack"], ["Webpack"]]);

    expect(tags).toEqual([{ tag: "Webpack", count: 3 }]);
  });

  it("표기가 갈리면 더 많이 쓴 쪽을 보여 준다", () => {
    const tags = collectTags([["Redis"], ["redis"], ["redis"]]);

    expect(tags[0].tag).toBe("redis");
  });

  it("한 글이 같은 태그를 두 번 써도 한 번만 센다", () => {
    expect(collectTags([["React", "react"]])).toEqual([
      { tag: "React", count: 1 },
    ]);
  });

  it("많이 쓴 태그가 먼저, 같으면 사전순", () => {
    const tags = collectTags([
      ["React", "가나다"],
      ["React"],
      ["나다라"],
    ]);

    expect(tags.map((t) => t.tag)).toEqual(["React", "가나다", "나다라"]);
  });

  it("별칭은 대표 표기로 합쳐서 센다", () => {
    const tags = collectTags([["a11y"], ["접근성"], ["접근성"]]);

    expect(tags).toEqual([{ tag: "접근성", count: 3 }]);
  });

  it("별칭의 대표 표기는 많이 쓴 쪽에 밀리지 않는다", () => {
    const tags = collectTags([["a11y"], ["a11y"], ["접근성"]]);

    expect(tags[0].tag).toBe("접근성");
  });

  it("태그가 없거나 빈 문자열이면 무시한다", () => {
    expect(collectTags([undefined, [], ["  "]])).toEqual([]);
  });
});
