import { expect, test, type Page } from "@playwright/test";
import { enterStudio } from "./helpers";
async function openDesk(page: Page) {
  await enterStudio(page);
  await page.getByRole("button", { name: "کمد ابزار الکترونیک" }).click();
  const cabinet = page.getByRole("dialog");
  await cabinet.getByRole("button", { name: /برداشتن فیوز یدکی ۲ آمپر/ }).click();
  await cabinet.getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "بررسی فیوز یدکی ۲ آمپر" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "استفاده روی محیط" }).click();
  await page.getByRole("button", { name: "دستگاه ضبط و پخش ریل" }).click();
  await expect(page.locator(".sf-status")).toContainText("فیوز ۲ آمپر در جایگاه ورودی نصب شد");
  await page.getByRole("button", { name: "دستگاه ضبط و پخش ریل" }).click();
  const device = page.getByRole("dialog");
  await device.getByRole("button", { name: "بررسی دفترچه تعمیرات" }).click();
  await device.getByRole("button", { name: "باز کردن میز صوتی" }).click();
  return page.getByRole("dialog");
}
async function calibrate(page: Page) {
  const desk = await openDesk(page);
  await desk.getByRole("button", { name: "روشن کردن دستگاه" }).click();
  await expect(desk.getByRole("status")).toContainText("۱۱۰V");
  await desk.getByRole("button", { name: /۱۱۰V · ترانس کاهنده/ }).click();
  await desk.getByRole("button", { name: "روشن کردن دستگاه" }).click();
  await desk.getByRole("button", { name: "۹٫۵ cm/s" }).click();
  await desk.getByRole("button", { name: "پخش سوت مرجع" }).click();
  await expect(desk.getByRole("status")).toContainText("سرعت انتخاب‌شده");
  await expect(desk.getByRole("button", { name: "پخش سوت مرجع" })).toBeEnabled();
  await desk.getByRole("button", { name: "۱۹ cm/s" }).click();
  await desk.getByRole("button", { name: "پخش سوت مرجع" }).click();
  await expect(desk.getByText("معمای کالیبراسیون حل شد")).toBeVisible({ timeout: 5000 });
  return desk;
}
test("phase 3: electrical safety and 19 cm/s calibration unlock the transcript", async ({ page }) => {
  await page.goto("/");
  const desk = await calibrate(page);
  await desk.getByRole("button", { name: "گشودن رونوشت نوار" }).click();
  const dialogue = page.getByRole("dialog");
  await expect(dialogue.getByRole("heading", { name: "رونوشت نخستین پخش نوار سیزدهم" })).toBeVisible();
  await expect(dialogue.getByText(/انبار شمارهٔ ۲ آب گرفته/)).toBeVisible();
  await dialogue.getByRole("button", { name: "اشاره به انبار شمارهٔ ۲ را ثبت کن" }).click();
  await expect(dialogue.getByRole("status")).toContainText("سرنخ مسیر محموله");
});
test("phase 3: low-pass 300 Hz and notch 50 Hz reveal the simulated motor peak", async ({ page }) => {
  await page.goto("/");
  const desk = await calibrate(page);
  await desk.getByRole("button", { name: "گشودن رونوشت نوار" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "بررسی صدای پس‌زمینهٔ موتور" }).click();
  const motorDesk = page.getByRole("dialog");
  await expect(motorDesk.getByRole("tab", { name: "تحلیل موتور" })).toHaveAttribute("aria-selected", "true");
  await motorDesk.getByLabel("فرکانس پایین‌گذر").selectOption("300");
  await motorDesk.getByLabel("فرکانس حذف هام").selectOption("50");
  await motorDesk.getByRole("button", { name: "تحلیل سیگنال" }).click();
  await expect(motorDesk.getByRole("status")).toContainText("تحلیل تأیید شد", { timeout: 10000 });
  await expect(motorDesk.getByText(/قلهٔ فعلی/)).toBeVisible();
  await motorDesk.getByRole("button", { name: "ثبت کاتالوگ در دفترچه" }).click();
  await motorDesk.getByRole("button", { name: "بازگشت به اتاق" }).click();
  await page.getByRole("button", { name: "دفترچهٔ آوا" }).click();
  const journal = page.getByRole("dialog");
  await expect(journal.getByText("قلهٔ صدای موتور نزدیک ۴۰ هرتز")).toBeVisible();
  await expect(journal.getByText("کاتالوگ موتورهای بنادر شمال")).toBeVisible();
});
