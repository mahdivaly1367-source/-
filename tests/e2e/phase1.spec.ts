import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { enterStudio } from "./helpers";

async function expectDebugPercent(page: Page, label: string, expected: number) {
  await expect.poll(async () => {
    const text = await page.locator(".sf-debug-readout").innerText();
    const match = text.match(new RegExp(label + " (\\d+(?:\\.\\d+)?)%"));
    return match ? Number(match[1]) : Number.NaN;
  }).toBeCloseTo(expected, 0);
}

test.beforeEach(async ({ page }) => {
  await enterStudio(page);
});

test("capture the rendered studio and verify the character sprite foot origin", async ({ page }) => {
  const background = page.locator(".sf-background");
  await expect(background).toBeVisible();
  await expect.poll(() =>
    background.evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);

  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/phase1-studio-full.png", fullPage: true });
  await page.locator(".sf-viewport").screenshot({ path: "artifacts/phase1-studio-viewport.png" });

  const sprite = page.locator(".sf-ava-art");
  const origin = await sprite.evaluate((element) => {
    const style = getComputedStyle(element);
    const parts = style.transformOrigin.split(" ").map((value) => Number.parseFloat(value));
    return {
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
      originX: parts[0],
      originY: parts[1],
    };
  });

  expect(origin.width).toBeGreaterThan(0);
  expect(origin.height).toBeGreaterThan(0);
  expect(Math.abs(origin.originX - origin.width / 2)).toBeLessThanOrEqual(0.25);
  expect(Math.abs(origin.originY - origin.height)).toBeLessThanOrEqual(0.25);

  const footAnchor = await page.locator(".sf-character").evaluate((element) => {
    const style = getComputedStyle(element);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return {
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
      translateX: matrix.m41,
      translateY: matrix.m42,
    };
  });
  expect(Math.abs(footAnchor.translateX + footAnchor.width * 0.5)).toBeLessThanOrEqual(0.25);
  expect(Math.abs(footAnchor.translateY + footAnchor.height * 0.96)).toBeLessThanOrEqual(0.25);

  const viewport = page.locator(".sf-viewport");
  const bounds = await viewport.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) throw new Error("Game viewport has no rendered bounds.");

  const debugToggle = page.getByRole("button", { name: /ابزار آزمون/ });
  await debugToggle.click();
  await viewport.click({
    position: { x: bounds.width * 0.3, y: bounds.height * 0.85 },
  });
  await expectDebugPercent(page, "Foot Y", 85);
  const nearScale = await sprite.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--sf-depth-scale")),
  );
  expect(nearScale).toBeGreaterThan(0);
  await debugToggle.click();
  await page.screenshot({ path: "artifacts/phase1-studio-near.png", fullPage: true });

  await debugToggle.click();
  await viewport.click({
    position: { x: bounds.width * 0.5, y: bounds.height * 0.14 },
  });
  await expectDebugPercent(page, "Foot Y", 75);
  const farScale = await sprite.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--sf-depth-scale")),
  );
  expect(nearScale).toBeGreaterThan(farScale);
  await debugToggle.click();
  await page.screenshot({ path: "artifacts/phase1-studio-far.png", fullPage: true });
});

test("click movement remains within the walkable polygon and projects outside clicks", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.getByRole("button", { name: /ابزار آزمون/ }).click();
  const viewport = page.locator(".sf-viewport");
  const bounds = await viewport.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) throw new Error("Game viewport has no rendered bounds.");

  await viewport.click({
    position: { x: bounds.width * 0.3, y: bounds.height * 0.85 },
  });
  await expectDebugPercent(page, "X", 30);
  await expectDebugPercent(page, "Foot Y", 85);

  await viewport.click({
    position: { x: bounds.width * 0.5, y: bounds.height * 0.14 },
  });
  await expect.poll(async () => {
    const text = await page.locator(".sf-debug-readout").innerText();
    const match = text.match(/X (\d+(?:\.\d+)?)%/);
    return match ? Number(match[1]) : Number.NaN;
  }).toBeCloseTo(50, 0);
  await expectDebugPercent(page, "Foot Y", 75);
  expect(pageErrors).toEqual([]);
});

test("hotspots expose contextual icons and open a dismissible inspection dialog", async ({ page }) => {
  const tapeHotspot = page.getByRole("button", { name: "دستگاه ضبط و پخش ریل" });
  const label = page.locator(".sf-hotspot-label").filter({ hasText: "دستگاه ضبط و پخش ریل" });

  await tapeHotspot.hover();
  await expect(label).toBeVisible();
  await expect(label.locator("svg")).toHaveCount(1);

  await tapeHotspot.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "ضبط‌صوت ریواکس B77" })).toBeVisible();
  await dialog.getByRole("button", { name: "ادامهٔ کاوش" }).click();
  await expect(dialog).toHaveCount(0);
});

test("hotspots remain keyboard accessible and Escape closes inspection", async ({ page }) => {
  const hotspot = page.getByRole("button", { name: "تخته اعلانات شیفت" });
  await hotspot.focus();
  await expect(page.locator(".sf-hotspot-label").filter({ hasText: "تخته اعلانات شیفت" })).toBeVisible();

  await hotspot.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("game viewport fits a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const viewport = page.locator(".sf-viewport");
  await expect(viewport).toBeVisible();

  const sizes = await page.evaluate(() => ({
    viewportWidth: document.querySelector(".sf-viewport")?.getBoundingClientRect().width ?? 0,
    windowWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(sizes.viewportWidth).toBeGreaterThan(0);
  expect(sizes.viewportWidth).toBeLessThanOrEqual(sizes.windowWidth);
  expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.windowWidth + 1);
});
