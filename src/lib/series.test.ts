import { describe, expect, it, vi } from "vitest";
import type { PostMeta } from "@/lib/posts";

const posts: PostMeta[] = [
  {
    slug: "ddia-3",
    title: "DDIA 정리 (3) — 저장소와 검색",
    description: "",
    date: "2026-09-03",
    series: "DDIA 정리",
    seriesOrder: 3,
  },
  {
    slug: "ddia-1",
    title: "DDIA 정리 (1) — 신뢰성",
    description: "",
    date: "2026-09-01",
    series: "DDIA 정리",
    seriesOrder: 1,
  },
  {
    slug: "ddia-2",
    title: "DDIA 정리 (2) — 데이터 모델",
    description: "",
    date: "2026-09-02",
    series: "DDIA 정리",
    seriesOrder: 2,
  },
  {
    slug: "혼자",
    title: "연재가 아닌 글",
    description: "",
    date: "2026-09-04",
  },
  {
    slug: "외톨이",
    title: "1편만 쓴 시리즈 (1)",
    description: "",
    date: "2026-09-05",
    series: "1편만 쓴 시리즈",
    seriesOrder: 1,
  },
];

vi.mock("@/lib/posts", () => ({ getAllPosts: () => posts }));

const { getSeries } = await import("@/lib/series");

describe("getSeries", () => {
  it("시리즈 순서대로 줄을 세운다", () => {
    const series = getSeries("ddia-2");

    expect(series?.entries.map((e) => e.slug)).toEqual([
      "ddia-1",
      "ddia-2",
      "ddia-3",
    ]);
  });

  it("지금 보는 글의 위치를 알려 준다", () => {
    const series = getSeries("ddia-3");

    expect(series?.position).toBe(3);
    expect(series?.total).toBe(3);
    expect(series?.entries.filter((e) => e.current)).toHaveLength(1);
  });

  it("목차에서는 시리즈 이름과 번호를 덜어낸다", () => {
    const series = getSeries("ddia-1");

    expect(series?.entries[0].title).toBe("신뢰성");
  });

  it("연재가 아닌 글은 시리즈가 없다", () => {
    expect(getSeries("혼자")).toBeNull();
  });

  it("혼자뿐인 시리즈는 묶지 않는다", () => {
    expect(getSeries("외톨이")).toBeNull();
  });

  it("없는 글이면 null", () => {
    expect(getSeries("없는-글")).toBeNull();
  });
});
