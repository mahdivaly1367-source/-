import { expect, test } from "@playwright/test";

test("phase 5: atmosphere follows the active scene and sound is opt-in", async ({ page }) => {
  await page.goto("/");
  const atmosphere = page.locator(".sf-atmosphere");
  const toggle = page.getByTestId("ambience-toggle");

  await expect(atmosphere).toHaveClass(/sf-atmosphere--scene_exterior/);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAccessibleName("فعال کردن صدای محیط");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("خاموش کردن صدای محیط");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});
