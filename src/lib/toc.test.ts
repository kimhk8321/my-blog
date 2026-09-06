import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/toc";

describe("extractToc", () => {
  it("h2와 h3만 목차에 담는다", () => {
    const toc = extractToc(["# 제목", "## 둘", "### 셋", "#### 넷"].join("\n"));

    expect(toc.map((item) => [item.level, item.text])).toEqual([
      [2, "둘"],
      [3, "셋"],
    ]);
  });

  it("코드 블록 안의 주석을 헤딩으로 착각하지 않는다", () => {
    const mdx = ["## 진짜 헤딩", "```bash", "# 이건 주석이다", "```"].join("\n");

    expect(extractToc(mdx).map((item) => item.text)).toEqual(["진짜 헤딩"]);
  });

  it("제목이 중복되면 뒤쪽에 번호를 붙인다", () => {
    const toc = extractToc(["## 정리", "## 정리"].join("\n"));

    expect(toc.map((item) => item.id)).toEqual(["정리", "정리-1"]);
  });

  it("목차에 넣지 않는 단계도 중복 번호 계산에는 넣는다", () => {
    // h4가 슬러그를 먼저 가져가므로, 뒤의 h2는 "정리-1"이 되어야
    // 실제 렌더링(rehype-slug) 결과와 어긋나지 않는다
    const toc = extractToc(["#### 정리", "## 정리"].join("\n"));

    expect(toc.map((item) => item.id)).toEqual(["정리-1"]);
  });

  it("마크다운 기호를 걷어낸 글자로 id를 만든다", () => {
    const toc = extractToc("## **굵게** 와 `코드` 와 [링크](/a)");

    expect(toc[0].text).toBe("굵게 와 코드 와 링크");
    expect(toc[0].id).toBe("굵게-와-코드-와-링크");
  });

  it("헤딩이 없으면 빈 배열", () => {
    expect(extractToc("그냥 본문입니다.")).toEqual([]);
  });
});
