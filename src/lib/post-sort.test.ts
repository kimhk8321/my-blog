import { describe, expect, it } from "vitest";
import { sortPosts } from "@/lib/post-sort";
import type { PostMeta } from "@/lib/posts";

function post(partial: Partial<PostMeta> & { slug: string }): PostMeta {
  return {
    title: partial.slug,
    description: "",
    date: "2026-01-01",
    ...partial,
  };
}

describe("sortPosts", () => {
  it("최신순은 날짜가 늦은 글이 앞", () => {
    const sorted = sortPosts(
      [
        post({ slug: "old", date: "2026-01-01" }),
        post({ slug: "new", date: "2026-03-01" }),
      ],
      "latest",
    );

    expect(sorted.map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("같은 날짜면 order가 큰 글(나중에 쓴 글)이 앞", () => {
    const sorted = sortPosts(
      [
        post({ slug: "first", order: 1 }),
        post({ slug: "third", order: 3 }),
        post({ slug: "second", order: 2 }),
      ],
      "latest",
    );

    expect(sorted.map((p) => p.slug)).toEqual(["third", "second", "first"]);
  });

  it("오래된순은 최신순을 뒤집는다", () => {
    const input = [
      post({ slug: "a", date: "2026-01-01", order: 1 }),
      post({ slug: "b", date: "2026-01-01", order: 2 }),
      post({ slug: "c", date: "2026-02-01" }),
    ];

    const latest = sortPosts(input, "latest").map((p) => p.slug);
    const oldest = sortPosts(input, "oldest").map((p) => p.slug);

    expect(oldest).toEqual([...latest].reverse());
  });

  it("제목순은 한글을 사전 순으로 정렬한다", () => {
    const sorted = sortPosts(
      [
        post({ slug: "c", title: "다" }),
        post({ slug: "a", title: "가" }),
        post({ slug: "b", title: "나" }),
      ],
      "title",
    );

    expect(sorted.map((p) => p.title)).toEqual(["가", "나", "다"]);
  });

  it("원본 배열을 건드리지 않는다", () => {
    const input = [post({ slug: "a" }), post({ slug: "b", date: "2026-05-05" })];
    const before = input.map((p) => p.slug);

    sortPosts(input, "latest");

    expect(input.map((p) => p.slug)).toEqual(before);
  });
});
