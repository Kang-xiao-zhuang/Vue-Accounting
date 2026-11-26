import { expect, test } from "@playwright/test";

test("四个主标签可导航，记账闭环可写入并出现在记录列表", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "记录" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "统计" })).toBeVisible();

  await page.getByRole("link", { name: "记账" }).click();
  await expect(page.getByRole("heading", { name: "记一笔" })).toBeVisible();

  await page.getByRole("button", { name: /🍜/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // 数字键盘：5 → 0 得到 50
  await page.getByRole("dialog").getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "0", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "保存" }).click();

  await page.getByRole("link", { name: "记录" }).click();
  await expect(page.getByText("¥50.00", { exact: true }).first()).toBeVisible();

  // 统计是记录页内的标签，不是独立标签页
  await page.getByRole("tab", { name: "统计" }).click();
  await expect(page.getByRole("link", { name: "预算" })).toBeVisible();
  await page.getByRole("tab", { name: "记录" }).click();

  // 习惯已提为一级入口
  await page.getByRole("link", { name: "习惯" }).click();
  await expect(page.getByRole("heading", { name: "习惯" })).toBeVisible();

  await page.getByRole("link", { name: "更多" }).click();
  await expect(page.getByRole("heading", { name: "更多" })).toBeVisible();
});

test("三个二级页面可从更多入口导航并渲染", async ({ page }) => {
  await page.goto("/more");

  const cases = [
    { href: "/history", heading: "全部记录" },
    { href: "/todos", heading: "每日清单" },
    { href: "/recurring", heading: "周期交易" },
  ];

  for (const c of cases) {
    await page.locator(`a[href="${c.href}"]`).click();
    await expect(page.getByRole("heading", { name: c.heading })).toBeVisible();
    await page.goto("/more");
  }
});

test("习惯可创建并打卡，清单可新增任务", async ({ page }) => {
  await page.goto("/habits");
  await page.getByRole("button", { name: "新建习惯" }).click();
  await page.getByPlaceholder("新习惯名称…").fill("阅读");
  await page.getByRole("button", { name: "添加习惯" }).click();
  await expect(page.getByText("阅读")).toBeVisible();
  await page.getByRole("button", { name: /打卡/ }).first().click();
  await expect(page.getByText(/✓/).first()).toBeVisible();

  await page.goto("/todos");
  await page.getByPlaceholder("添加这一天的一项任务…").fill("买菜");
  await page.getByRole("button", { name: "记一笔" }).click();
  await expect(page.getByText("买菜")).toBeVisible();
});
