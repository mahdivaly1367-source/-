import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("phase 2: collecting a fuse adds it to inventory and opens a detailed inspection", async ({ page }) => {
  await page.getByRole("button", { name: "کمد ابزار الکترونیک" }).click();

  const cabinetDialog = page.getByRole("dialog");
  await expect(cabinetDialog.getByRole("heading", { name: "کمد ابزار فلزی" })).toBeVisible();
  await cabinetDialog.getByRole("button", { name: /برداشتن فیوز یدکی ۲ آمپر/ }).click();

  const fuseSlot = page.getByRole("button", { name: "بررسی فیوز یدکی ۲ آمپر" });
  await expect(fuseSlot).toBeVisible();
  await cabinetDialog.getByRole("button", { name: "ادامهٔ کاوش" }).click();

  await fuseSlot.click();
  const itemDialog = page.getByRole("dialog");
  await expect(itemDialog.getByRole("heading", { name: "فیوز یدکی ۲ آمپر" })).toBeVisible();
  await expect(itemDialog.getByText(/رشتهٔ فلزی داخل شیشه سالم است/)).toBeVisible();
  await itemDialog.getByRole("button", { name: "چرخاندن شیء" }).click();
  await expect(itemDialog).toBeVisible();
});

test("phase 2: clues are recorded and a cautious hypothesis can be linked", async ({ page }) => {
  await page.getByRole("button", { name: "بررسی نوار ریل سیزدهم" }).click();
  await expect(page.getByRole("dialog").getByText(/مرجع سوت پایلوت ۱۰۰۰ هرتز/)).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "بازگشت" }).click();

  await page.getByRole("button", { name: "تخته اعلانات شیفت" }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "برنامهٔ کشیک ـ ۲۳ آبان ۱۳۷۸" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "ادامهٔ کاوش" }).click();

  await page.getByRole("button", { name: "دفترچهٔ آوا" }).click();
  const journal = page.getByRole("dialog");
  await expect(journal.getByText("برچسب فنی نوار سیزدهم")).toBeVisible();
  await expect(journal.getByText("ثبت کشیک ساعت ۲۲:۱۰")).toBeVisible();

  await journal.getByRole("tab", { name: "استنتاج" }).click();
  await journal.getByLabel("برچسب فنی نوار سیزدهم").check();
  await journal.getByLabel("ثبت کشیک ساعت ۲۲:۱۰").check();
  await journal.getByRole("button", { name: "اتصال شواهد انتخاب‌شده" }).click();
  await expect(journal.getByRole("heading", { name: "زمان ثبت کشیک نیازمند راستی‌آزمایی است" })).toBeVisible();
  await expect(journal.getByText(/به‌تنهایی جعل، زمان دقیق واقعه یا هویت مسئول را ثابت نمی‌کند/)).toBeVisible();
});

test("phase 2: a dropped mismatched item gives feedback and is not consumed", async ({ page }) => {
  await page.getByRole("button", { name: "کمد ابزار الکترونیک" }).click();
  const cabinetDialog = page.getByRole("dialog");
  await cabinetDialog.getByRole("button", { name: /برداشتن فیوز یدکی ۲ آمپر/ }).click();
  await cabinetDialog.getByRole("button", { name: "ادامهٔ کاوش" }).click();

  const fuseSlot = page.getByRole("button", { name: "بررسی فیوز یدکی ۲ آمپر" });
  const windowHotspot = page.getByRole("button", { name: "پنجره رو به دریا" });
  await fuseSlot.dragTo(windowHotspot);
  await expect(page.locator(".sf-status")).toContainText(/کاربرد روشنی روی/);
  await expect(fuseSlot).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
