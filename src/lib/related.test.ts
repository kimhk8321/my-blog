import { describe, expect, it, vi } from "vitest";
import { fixturePosts } from "@/lib/__fixtures__/posts";

vi.mock("@/lib/posts", () => ({
  getAllPostsWithContent: () => fixturePosts,
  getAllPosts: () => fixturePosts,
}));

const { getRelatedPosts } = await import("@/lib/related");

describe("getRelatedPosts", () => {
  it("같은 주제를 다룬 글을 먼저 올린다", () => {
    expect(getRelatedPosts("react-hooks")[0].slug).toBe("react-store");
  });

  it("자기 자신은 빼고 추천한다", () => {
    expect(getRelatedPosts("react-hooks").map((p) => p.slug)).not.toContain(
      "react-hooks",
    );
  });

  it("상관없는 글로 개수를 채우지 않는다", () => {
    const related = getRelatedPosts("react-hooks", 3).map((p) => p.slug);

    expect(related).not.toContain("css-grid");
    expect(related).not.toContain("mysql-index");
  });

  it("limit을 넘지 않는다", () => {
    expect(getRelatedPosts("react-hooks", 1)).toHaveLength(1);
  });

  it("점수를 함께 돌려준다", () => {
    expect(getRelatedPosts("react-hooks")[0].score).toBeGreaterThan(0);
  });

  it("없는 글이면 빈 배열", () => {
    expect(getRelatedPosts("없는-글")).toEqual([]);
  });
});
