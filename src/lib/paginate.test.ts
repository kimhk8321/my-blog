import { describe, expect, it } from "vitest";
import { ELLIPSIS, paginate, pageWindow } from "@/lib/paginate";

const items = Array.from({ length: 25 }, (_, i) => i + 1);

describe("paginate", () => {
  it("첫 쪽은 앞에서부터 perPage만큼", () => {
    const result = paginate(items, 1, 10);

    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
  });

  it("마지막 쪽은 남는 만큼만", () => {
    expect(paginate(items, 3, 10).items).toEqual([21, 22, 23, 24, 25]);
  });

  it("범위를 벗어난 쪽은 양 끝으로 당긴다", () => {
    expect(paginate(items, 0, 10).page).toBe(1);
    expect(paginate(items, 999, 10).page).toBe(3);
    expect(paginate(items, Number.NaN, 10).page).toBe(1);
  });

  it("항목이 없어도 1쪽으로 센다", () => {
    const result = paginate([], 1, 10);

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
  });

  it("원본 배열을 건드리지 않는다", () => {
    paginate(items, 2, 10);

    expect(items).toHaveLength(25);
  });
});

describe("pageWindow", () => {
  it("적으면 전부 보여 준다", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("많으면 처음·끝·현재 주변만 남긴다", () => {
    expect(pageWindow(5, 20)).toEqual([1, ELLIPSIS, 4, 5, 6, ELLIPSIS, 20]);
  });

  it("한 칸만 비면 생략 대신 그 번호를 넣는다", () => {
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("현재 쪽이 끝에 있으면 창이 끝으로 붙는다", () => {
    expect(pageWindow(20, 20)).toEqual([1, ELLIPSIS, 19, 20]);
  });
});
