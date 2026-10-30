import { test, expect, type Locator } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv"; 

dotenv.config();

/** Sets a noUi range slider without pointer drag (avoids overlay intercepts). */
async function setNoUiRange(slider: Locator): Promise<void> {
  await slider.evaluate((el) => {
    const node = el as HTMLElement & {
      noUiSlider?: {
        set: (values: (number | string)[]) => void;
        options?: { range?: Record<string, number | string> };
      };
    };
    if (!node.noUiSlider) {
      throw new Error("noUiSlider API is not available on this element");
    }
    const range = node.noUiSlider.options?.range;
    if (!range) {
      node.noUiSlider.set([0, 3]);
      return;
    }
    const values = Object.values(range)
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value))
      .sort((a, b) => a - b);
    const min = values[0] ?? 0;
    const max = values[values.length - 1] ?? min;
    const mid = values[Math.floor(values.length / 2)] ?? max;
    node.noUiSlider.set([min, mid]);
  });
}

test("check for diamonds with incorrect prices", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("https://www.luvansh.com/shop-diamond");
  await expect(page).toHaveTitle(/Shop Diamonds/);

  const topHeader = page.locator("#topHeader");
  if (await topHeader.count()) {
    await topHeader.evaluate((el) => el.remove());
  }

  const diamondShapeRound = page.getByRole("img", { name: "Round" }).first();
  await expect(diamondShapeRound).toBeVisible();
  await diamondShapeRound.click();

  const colourSlider = page.locator("#colorSlider");
  await colourSlider.scrollIntoViewIfNeeded();
  await expect(colourSlider).toBeVisible();
  await setNoUiRange(colourSlider);

  const caratMinInputBar = page.locator(".caratMinInput");
  const caratMaxInputBar = page.locator(".caratMaxInput");
  const priceBar = page.locator("#priceMin");
  const diamondRows = page
    .locator("table tbody tr")
    .filter({ hasText: /\$\d/ });

  await expect(caratMinInputBar).toBeVisible();
  await expect(caratMaxInputBar).toBeVisible();

  await caratMinInputBar.fill("1");
  console.log("choosing stones with min 1 carat weight");
  await caratMaxInputBar.fill("1.5");
  console.log("max weight is 1.5 carats now");

  await expect(priceBar).toBeVisible();
  await priceBar.click({ clickCount: 3 });
  await priceBar.fill("1");
  await priceBar.press("Enter");
  console.log("choosing stones with min price 1$");

  await expect(diamondRows.first()).toBeVisible({ timeout: 20_000 });

  const diamondCount = await diamondRows.count();
  console.log(`🔍 Found ${diamondCount} diamonds in the list.`);

  // Устанавливаем пороговую цену
  const priceThreshold = 10; // Уведомление о цене ниже 10$

  for (let i = 0; i < diamondCount; i++) {
    const row = diamondRows.nth(i);
    const priceText = await row.getByRole("cell").nth(1).textContent();
    const href = await row.locator("a[href]").first().getAttribute("href");

    if (priceText) {
      const priceMatch = priceText.match(/\$(\d[\d,]*(?:\.\d+)?)/);
      const price = priceMatch
        ? parseFloat(priceMatch[1].replace(/,/g, ""))
        : Number.NaN;
      if (Number.isNaN(price)) continue;

      const fullLink = href?.startsWith("http")
        ? href
        : href
          ? `https://www.luvansh.com${href}`
          : page.url();

      // Проверяем, если цена ниже порога
      if (price < priceThreshold) {
        console.log(
          `❗ Found diamond with low price: $${price}, link: ${fullLink}`
        );

        // Дополнительно: записываем информацию в файл
        fs.appendFileSync(
          path.resolve(__dirname, "low_price_diamonds.txt"),
          `Price: $${price}, Link: ${fullLink}\n`
        );

        if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
          await sendTelegramNotification(price, fullLink);
        }
      }
    }
  }

  console.log("✅ Test completed");
});

// Функция для отправки уведомления через Telegram
async function sendTelegramNotification(price: number, link: string): Promise<void> {
  const botToken = process.env.BOT_TOKEN; // Токен бота
  const chatId = process.env.CHAT_ID; // chatId, куда отправлять уведомления
  const message = `⚠️ Diamond found with price $${price}! Check it out: ${link}`;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId, // Добавили chatId в тело запроса
        text: message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send Telegram message: ${response.statusText}`);
  }
}
