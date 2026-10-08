import { expect, test } from "@playwright/test";

test("알고리즘 시리즈 목차와 단계별 데모가 동작한다", async ({ page }) => {
  await page.goto("/posts/algorithm-03-two-pointers");
  const series = page.getByRole("navigation", { name: "시리즈 목차" });
  await expect(series).toContainText("유형별 알고리즘 복습");
  await expect(series.getByRole("link")).toHaveCount(9);
  for (let step = 0; step < 3; step++) await page.getByRole("button", { name: "다음 단계" }).click();
  await expect(page.getByRole("status")).toContainText("지금까지 최대 9");
  await expect(page.getByRole("button", { name: "다음 단계" })).toBeDisabled();

  await page.goto("/posts/algorithm-04-binary-search");
  await page.getByLabel("target", { exact: true }).selectOption("10");
  for (let step = 0; step < 10; step++) {
    const next = page.getByRole("button", { name: "다음 단계" });
    if (await next.isDisabled()) break;
    await next.click();
  }
  await expect(page.getByRole("status")).toContainText("lower bound 인덱스 9");

  await page.goto("/posts/algorithm-05-dfs-bfs");
  for (let step = 0; step < 25; step++) {
    const next = page.getByRole("button", { name: "다음 단계" });
    if (await next.isDisabled()) break;
    await next.click();
  }
  await expect(page.getByRole("status")).toContainText("최소 이동 7회");
});

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

test("방명록 전송 실패 후 같은 작성 키로 재시도한다", async ({ page }) => {
  const keys: string[] = [];
  let attempts = 0;
  const entry = { id: "test-entry", name: "테스트", message: "재시도 확인", at: Date.now() };

  await page.route("**/api/guestbook", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { entries: [] } });
      return;
    }

    attempts += 1;
    keys.push(route.request().headers()["idempotency-key"]);
    await route.fulfill(
      attempts === 1
        ? { status: 500, json: { error: "응답을 받지 못했습니다" } }
        : { status: 200, json: { entry } },
    );
  });

  await page.goto("/guestbook");
  await page.getByPlaceholder("이름").fill("테스트");
  await page.getByPlaceholder("한마디 남겨 주세요 (최대 200자)").fill("재시도 확인");
  await page.getByRole("button", { name: "남기기" }).click();
  await expect(page.getByText("응답을 받지 못했습니다")).toBeVisible();
  await page.getByRole("button", { name: "남기기" }).click();

  await expect(page.getByText("재시도 확인")).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  expect(keys[1]).toBe(keys[0]);
});
