import { expect, test } from "@playwright/test";

test("검색어와 가장 관련 있는 글을 찾는다", async ({ page }) => {
  await page.goto("/search");

  const input = page.getByPlaceholder("검색어를 입력하세요 (제목·태그·본문)");
  await input.fill("React Compiler");

  const results = page.getByRole("main").getByRole("list").getByRole("listitem");
  await expect(results.first()).toContainText("React Compiler 실전 적용");
  await expect(page).toHaveURL(/\/search\?q=React(?:%20|\+)Compiler$/);
});

test("시리즈 목차에서 현재 글과 다음 글을 구분한다", async ({ page }) => {
  await page.goto("/posts/idempotency-key");

  const series = page.getByRole("navigation", { name: "시리즈 목차" });
  await expect(series).toContainText("요청 동시성 실전");
  await expect(series.getByText("Idempotency Key 직접 구현하기", { exact: false })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await series.getByRole("link", { name: /낙관적 동시성 제어/ }).click();
  await expect(page).toHaveURL("/posts/optimistic-concurrency-control");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("낙관적 동시성 제어");
});

test("같은 Idempotency Key는 한 번만 처리한다", async ({ page }) => {
  await page.goto("/posts/idempotency-key");

  await page.getByRole("button", { name: "같은 키로 5번 전송" }).click();
  await expect(page.getByText("서버에서 실제 처리한 횟수:")).toContainText("1");
  await expect(page.getByText("저장된 응답 재사용")).toHaveCount(4);
});

test("낙관적 동시성 제어가 오래된 편집기를 거절한다", async ({ page }) => {
  await page.goto("/posts/optimistic-concurrency-control");

  const editorA = page.getByRole("region", { name: "편집기 A" });
  const editorB = page.getByRole("region", { name: "편집기 B" });
  await editorA.getByRole("textbox").fill("A가 저장한 문서");
  await editorB.getByRole("textbox").fill("B가 저장한 문서");
  await editorA.getByRole("button", { name: "저장" }).click();
  await editorB.getByRole("button", { name: "저장" }).click();

  await expect(editorB).toContainText("409 충돌");
  await expect(page.getByText(/서버 문서/)).toContainText("A가 저장한 문서");
});
