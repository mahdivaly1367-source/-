import { expect, test, type Page } from "@playwright/test";
import { enterStudio } from "./helpers";
import { REQUIRED_SCENE_IDS, SCENE_TRANSITIONS } from "../../src/data/scenes";
import type { SceneId } from "../../src/data/scenes/studio";

async function enterPier(page: Page) {
  await page.getByRole("button", { name: "درب بازگشت به محوطه" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("محوطهٔ بیرونی ایستگاه");
  await page.getByRole("button", { name: "مسیر عمومی به اسکله" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("اسکله و کارگاه رادیو");
}

async function revealPanelEvidence(page: Page) {
  await page.getByRole("button", { name: "بررسی آچار فرانسه فرسوده" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "استفاده روی محیط" }).click();
  await page.getByRole("button", { name: "تابلوی قطع فرستنده" }).click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByText(/قاب باز شده است/)).toBeVisible();
  await panel.getByRole("button", { name: "برداشتن فیوز به‌عنوان مدرک" }).click();
  await panel.getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "بررسی فیوز دست‌کاری‌شدهٔ فرستنده" }).click();
  await expect(page.getByRole("dialog").getByText(/رشته نسوخته/)).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "بازگشت" }).click();
}

async function solveBahmanPuzzle(page: Page) {
  await page.getByRole("button", { name: "تخته اعلانات شیفت" }).click();
  const board = page.getByRole("dialog");
  await board.getByRole("button", { name: "برداشتن برگهٔ ثبت کشیک اصلاح‌شده" }).click();
  await board.getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "بررسی برگهٔ ثبت کشیک اصلاح‌شده" }).click();
  await expect(page.getByRole("dialog").getByText(/تفاوت جوهر/)).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "بازگشت" }).click();

  await revealPanelEvidence(page);
  await enterPier(page);
  await page.getByRole("button", { name: "میز کار بهمن" }).click();
  const bench = page.getByRole("dialog");
  await bench.getByRole("button", { name: "برداشتن انبردست بهمن" }).click();
  await bench.getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "بررسی انبردست بهمن" }).click();
  await expect(page.getByRole("dialog").getByText(/الگوی دندانه‌ها/)).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "بازگشت" }).click();

  await page.getByRole("button", { name: "میز کار بهمن" }).click();
  const interview = page.getByRole("dialog");
  await expect(interview.getByText(/سه قرینه آماده است/)).toBeVisible();
  await interview.getByRole("button", { name: "ارائهٔ شواهد و گفت‌وگو با بهمن" }).click();
  await expect(page.locator(".sf-status")).toContainText("کلید فانوس را به آوا سپرد");
  await interview.getByRole("button", { name: "ادامهٔ کاوش" }).click();
}

test("phase 4: the declared six-scene graph is connected from the opening scene", () => {
  const reached = new Set<SceneId>(["scene_exterior"]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [from, to] of SCENE_TRANSITIONS) {
      if (reached.has(from) && !reached.has(to)) { reached.add(to); changed = true; }
    }
  }
  expect([...reached].sort()).toEqual([...REQUIRED_SCENE_IDS].sort());
});

test("phase 4: transitions work and a missing lighthouse key does not trap the player", async ({ page }) => {
  await enterStudio(page);
  await page.getByRole("button", { name: "درب راهروی آرشیو" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("مخزن آرشیو نوارها");
  await page.getByRole("button", { name: "بازگشت به استودیو" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("اتاق پخش و استودیو");

  await enterPier(page);
  await page.getByRole("button", { name: "مسیر فانوس دریایی" }).click();
  const lockedDoor = page.getByRole("dialog");
  await expect(lockedDoor.getByText(/کلید فانوس/)).toBeVisible();
  await lockedDoor.getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "مسیر فرعی خانهٔ راد" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("خانهٔ قدیمی خانوادهٔ راد");
  await page.getByRole("button", { name: "بازگشت به اسکله" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("اسکله و کارگاه رادیو");
  await page.getByRole("button", { name: "بازگشت به محوطهٔ بیرونی" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("محوطهٔ بیرونی ایستگاه");
});

test("phase 4: physical evidence unlocks Bahman's confession and the lighthouse key", async ({ page }) => {
  await enterStudio(page);
  await solveBahmanPuzzle(page);
  await expect(page.getByRole("button", { name: "بررسی کلید فانوس دریایی" })).toBeVisible();
  await page.getByRole("button", { name: "مسیر فانوس دریایی" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("فانوس دریایی صخرهٔ سیاه");
  await page.getByRole("button", { name: "میز گرد خسرو" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "گفت‌وگو با خسرو و دریافت دیاپازون" }).click();
  await expect(page.getByRole("button", { name: "بررسی دیاپازون نقره‌ای سهراب" })).toBeVisible();
});

test("phase 4: tuning resonance plus the documented 1359 code opens the master-tape chamber and ending", async ({ page }) => {
  test.setTimeout(120000);
  await enterStudio(page);
  await solveBahmanPuzzle(page);

  await page.getByRole("button", { name: "مسیر فانوس دریایی" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("فانوس دریایی صخرهٔ سیاه");
  await page.getByRole("button", { name: "میز گرد خسرو" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "گفت‌وگو با خسرو و دریافت دیاپازون" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "ادامهٔ کاوش" }).click();

  await page.getByRole("button", { name: "بازگشت به اسکله" }).click();
  await page.getByRole("button", { name: "مسیر فرعی خانهٔ راد" }).click();
  await page.getByRole("button", { name: "قاب عکس افتتاحیه" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "رادیوی لامپی و یادداشت فنی" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await page.getByRole("button", { name: "دفترچه شعر سهراب" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "ادامهٔ کاوش" }).click();

  await page.getByRole("button", { name: "بازگشت به اسکله" }).click();
  await page.getByRole("button", { name: "بازگشت به محوطهٔ بیرونی" }).click();
  await page.getByRole("button", { name: "درب زنجیرشدهٔ ایستگاه" }).click();
  await expect(page.locator(".sf-scene-name")).toHaveText("اتاق پخش و استودیو");

  await page.getByRole("button", { name: "بررسی دیاپازون نقره‌ای سهراب" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "استفاده روی محیط" }).click();
  await page.getByRole("button", { name: "فرش لاکی کنار میز" }).click();
  const hatch = page.getByRole("dialog");
  await expect(hatch.getByLabel("رمز دریچه")).toBeEnabled();
  await hatch.getByLabel("رمز دریچه").fill("1359");
  await hatch.getByRole("button", { name: "باز کردن دریچه" }).click();
  await expect(hatch.getByText("محفظه باز شده است")).toBeVisible();
  await expect(page.getByRole("button", { name: "بررسی نوار مستر سیزدهم" })).toBeVisible();
  await hatch.getByRole("button", { name: "ادامهٔ کاوش" }).click();

  await page.getByRole("button", { name: "درب بازگشت به محوطه" }).click();
  await page.getByRole("button", { name: "مواجهه با قاسم دانشیار" }).click();
  const confrontation = page.getByRole("dialog");
  await expect(confrontation.getByRole("button", { name: "تحویل شواهد و پایان پرونده" })).toBeEnabled();
  await confrontation.getByRole("button", { name: "تحویل شواهد و پایان پرونده" }).click();
  await expect(page.getByRole("heading", { name: "حقیقت در برابر امواج گم نشد" })).toBeVisible();
});
