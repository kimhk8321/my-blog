import { afterEach, describe, expect, it } from "vitest";
import { passwordMatches } from "@/lib/admin";

const original = process.env.ADMIN_PASSWORD;
afterEach(() => {
  process.env.ADMIN_PASSWORD = original;
});

describe("passwordMatches", () => {
  it("같은 비밀번호면 통과", () => {
    process.env.ADMIN_PASSWORD = "s3cret-pass";

    expect(passwordMatches("s3cret-pass")).toBe(true);
  });

  it("다르면 거절", () => {
    process.env.ADMIN_PASSWORD = "s3cret-pass";

    expect(passwordMatches("s3cret-pasS")).toBe(false);
  });

  it("길이가 달라도 예외 없이 거절한다", () => {
    // timingSafeEqual은 길이가 다르면 던진다.
    // 해시로 길이를 맞춘 뒤 비교하므로 여기서 터지면 안 된다.
    process.env.ADMIN_PASSWORD = "short";

    expect(() => passwordMatches("아주 긴 비밀번호를 넣어 본다")).not.toThrow();
    expect(passwordMatches("아주 긴 비밀번호를 넣어 본다")).toBe(false);
  });

  it("빈 입력도 거절", () => {
    process.env.ADMIN_PASSWORD = "s3cret-pass";

    expect(passwordMatches("")).toBe(false);
  });

  it("비밀번호가 설정돼 있지 않으면 무엇을 넣어도 거절", () => {
    delete process.env.ADMIN_PASSWORD;

    expect(passwordMatches("")).toBe(false);
    expect(passwordMatches("아무거나")).toBe(false);
  });
});
