import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("capture the rendered studio and verify the character sprite foot origin", async ({ page }) => {
  const background = page.locator(".sf-background");
  await expect(background).toBeVisible();
  await expect.poll(() =>
    background.evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);

  const sprite = page.locator(".sf-ava-art");
  const origin = await sprite.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const parts = style.transformOrigin.split(" ").map(Number);
    return {
      width: rect.width,
      height: rect.height,
      originX: parts[0],
      originY: parts[1],
    };
  });

  expect(origin.width).toBeGreaterThan(0);
  expect(origin.height).toBeGreaterThan(0);
  expect(Math.abs(origin.originX - origin.width / 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(origin.originY - origin.height)).toBeLessThanOrEqual(1);

  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/phase1-studio-full.png", fullPage: true });
  await page.locator(".sf-viewport").screenshot({ path: "artifacts/phase1-studio-viewport.png" });
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
  await expect.poll(() => page.locator(".sf-debug-readout").innerText()).toContain("X 30.0%");
  await expect.poll(() => page.locator(".sf-debug-readout").innerText()).toContain("Foot Y 85.0%");

  await viewport.click({
    position: { x: bounds.width * 0.5, y: bounds.height * 0.14 },
  });
  await expect.poll(async () => {
    const text = await page.locator(".sf-debug-readout").innerText();
    const match = text.match(/X (\d+(?:\.\d+)?)%/);
    return match ? Number(match[1]) : Number.NaN;
  }).toBeCloseTo(50, 0);
  await expect.poll(() => page.locator(".sf-debug-readout").innerText()).toContain("Foot Y 64.0%");
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
