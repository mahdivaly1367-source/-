import { expect, test } from "@playwright/test";
import { enterStudio } from "./helpers";

test("phase 5: atmosphere follows the active scene and sound is opt-in", async ({ page }) => {
  await page.goto("/");
  const atmosphere = page.locator(".sf-atmosphere");
  const toggle = page.getByTestId("ambience-toggle");

  await expect(atmosphere).toHaveClass(/sf-atmosphere--scene_exterior/);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAccessibleName("فعال کردن صدای محیط");

  await enterStudio(page);
  await expect(atmosphere).toHaveClass(/sf-atmosphere--scene_studio/);
  await expect(page.locator(".sf-foreground")).toHaveAttribute("src", "/assets/studio-foreground.svg");
  await expect(page.locator(".sf-foreground")).toHaveJSProperty("complete", true);
  await expect(page.locator(".sf-foreground")).toHaveJSProperty("naturalWidth", 1600);
  await expect(page.locator(".sf-rain-glass")).toHaveCSS("display", "block");
  await expect(page.locator(".sf-window-haze")).toHaveCSS("display", "block");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("خاموش کردن صدای محیط");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});
