import { describe, expect, it, vi } from "vitest";
import { fixturePosts } from "@/lib/__fixtures__/posts";

vi.mock("@/lib/posts", () => ({
  getAllPostsWithContent: () => fixturePosts,
  getAllPosts: () => fixturePosts,
}));

const { search } = await import("@/lib/search");

describe("search", () => {
  it("주제가 맞는 글이 1등", () => {
    expect(search("인덱스")[0].slug).toBe("mysql-index");
  });

  it("제목·태그에 있는 글이 본문에만 있는 글보다 위", () => {
    const hits = search("상태 관리").map((h) => h.slug);

    expect(hits[0]).toBe("react-store");
    expect(hits).not.toContain("css-grid");
  });

  it("한글이 조사와 붙어 있어도 찾는다", () => {
    expect(search("렌더링").map((h) => h.slug)).toContain("react-hooks");
  });

  it("대소문자를 가리지 않는다", () => {
    expect(search("REACT").map((h) => h.slug)).toEqual(
      search("react").map((h) => h.slug),
    );
  });

  it("검색어 주변을 잘라 미리보기를 만든다", () => {
    const [hit] = search("실행 계획");

    expect(hit.snippet).toContain("실행 계획");
  });

  it("없는 말이면 빈 결과", () => {
    expect(search("쿠버네티스헬름차트")).toEqual([]);
  });

  it("빈 검색어는 빈 결과", () => {
    expect(search("   ")).toEqual([]);
  });

  it("limit만큼만 돌려준다", () => {
    expect(search("상태", 1)).toHaveLength(1);
  });
});
