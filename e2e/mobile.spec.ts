import { expect, test } from "@playwright/test";

test("모바일 메뉴로 이동해도 가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "메뉴 열기" }).click();
  const menu = page.locator("header").getByRole("navigation");
  const archiveLink = menu.getByRole("link", { name: "아카이브", exact: true });
  await expect(archiveLink).toBeVisible();
  await archiveLink.click();

  await expect(page).toHaveURL("/archive");
  await expect(page.getByRole("heading", { level: 1, name: "아카이브" })).toBeVisible();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
