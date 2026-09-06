import { describe, expect, it } from "vitest";
import { tokenize } from "@/lib/search-index";

describe("tokenize — 한글", () => {
  it("색인할 땐 한 글자와 두 글자를 모두 넣는다", () => {
    // "훅" 같은 한 글자 검색을 지원하려면 유니그램도 필요하다
    expect(tokenize("리액트", "index")).toEqual([
      "리", "리액", "액", "액트", "트",
    ]);
  });

  it("검색할 땐 두 글자짜리만 쓴다", () => {
    // '트'가 "컴포넌트"에도 걸려 엉뚱한 글이 올라오는 것을 막는다
    expect(tokenize("리액트", "query")).toEqual(["리액", "액트"]);
  });

  it("한 글자로 검색하면 그 글자를 그대로 쓴다", () => {
    expect(tokenize("훅", "query")).toEqual(["훅"]);
  });

  it("조사가 붙어도 겹치는 조각이 나온다", () => {
    const withParticle = tokenize("루프를", "index");

    expect(withParticle).toContain("루프");
  });
});

describe("tokenize — 영문", () => {
  it("색인할 땐 접두사까지 넣어 부분 입력에 대비한다", () => {
    expect(tokenize("docker", "index")).toEqual([
      "docker", "do", "doc", "dock", "docke",
    ]);
  });

  it("검색할 땐 입력한 그대로만 쓴다", () => {
    expect(tokenize("docke", "query")).toEqual(["docke"]);
  });

  it("대소문자를 구분하지 않는다", () => {
    expect(tokenize("Docker", "query")).toEqual(tokenize("docker", "query"));
  });

  it("한글과 영문이 섞이면 각각의 규칙을 적용한다", () => {
    const tokens = tokenize("Redis 캐싱", "query");

    expect(tokens).toContain("redis");
    expect(tokens).toContain("캐싱");
  });
});
