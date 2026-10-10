import { expect, type Page } from "@playwright/test";

export async function enterStudio(page: Page) {
  await page.goto("/");
  await expect(page.locator(".sf-scene-name")).toHaveText("محوطهٔ بیرونی ایستگاه");
  await page.getByRole("button", { name: "جعبه‌ابزار کنار بولدوزر" }).click();
  const toolbox = page.getByRole("dialog");
  await toolbox.getByRole("button", { name: "برداشتن سیم‌چین عایق‌دار" }).click();
  await toolbox.getByRole("button", { name: "برداشتن آچار فرانسه فرسوده" }).click();
  await toolbox.getByRole("button", { name: "ادامهٔ کاوش" }).click();

  await page.getByRole("button", { name: "بررسی سیم‌چین عایق‌دار" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "استفاده روی محیط" }).click();
  await page.getByRole("button", { name: "درب زنجیرشدهٔ ایستگاه" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("اتاق پخش و استودیو", { timeout: 8000 });
}
