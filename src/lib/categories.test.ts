import { describe, expect, it } from "vitest";
import { categories, getCategoryById, isValidCategory } from "@/lib/categories";

describe("categories", () => {
  it("id가 겹치지 않는다", () => {
    const ids = categories.map((c) => c.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 카테고리에 이름이 있다", () => {
    expect(categories.every((c) => c.label.trim().length > 0)).toBe(true);
  });

  it("있는 id만 유효하다", () => {
    expect(isValidCategory(categories[0].id)).toBe(true);
    expect(isValidCategory("없는-카테고리")).toBe(false);
  });

  it("id로 카테고리를 찾는다", () => {
    expect(getCategoryById(categories[0].id)).toEqual(categories[0]);
    expect(getCategoryById("없는-카테고리")).toBeUndefined();
  });
});
