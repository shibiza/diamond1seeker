// @ts-check
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("check for diamonds with incorrect prices", async ({ page }) => {
  await page.goto("https://www.luvansh.com/shop-diamond");

  // Проверяем, что заголовок страницы корректный
  await expect(page).toHaveTitle(/Shop Lab Diamonds/);

  // Устанавливаем минимальный вес камней в 2 карата
  const caratBar = await page.locator("#txtminWeight");
  if (await caratBar.isVisible()) {
    await caratBar.fill("2");
    console.log("😊 Stones weight is now 2 carats and more");
  } else {
    throw new Error("💀 Carat bar is not found!");
  }

  // Дожидаемся загрузки списка бриллиантов
  const diamondRows = await page.locator(".diamond-row"); // Класс строк списка (примерный)
  const diamondCount = await diamondRows.count();

  console.log(`🔍 Found ${diamondCount} diamonds in the list.`);

  // Устанавливаем пороговую цену
  const priceThreshold = 10; // Уведомление о цене ниже 10$

  for (let i = 0; i < diamondCount; i++) {
    // Получаем данные для каждого бриллианта
    const priceText = await diamondRows
      .nth(i)
      .locator(".price-column")
      .textContent(); // Колонка цены
    const link = await diamondRows.nth(i).locator("a").getAttribute("href"); // Ссылка на бриллиант

    if (priceText) {
      const price = parseFloat(priceText.replace("$", "").trim());

      // Проверяем, если цена ниже порога
      if (price < priceThreshold) {
        console.log(
          `❗ Found diamond with low price: $${price}, link: ${link}`
        );

        // Дополнительно: записываем информацию в файл
        fs.appendFileSync(
          path.resolve(__dirname, "low_price_diamonds.txt"),
          `Price: $${price}, Link: ${link}\n`
        );

        // Можно интегрировать отправку сообщения через Telegram или email
        // Например, используя Telegram Bot API
        await sendTelegramNotification(price, `https://www.luvansh.com${link}`);
      }
    }
  }

  console.log("✅ Test completed");
});

// Функция для отправки уведомления через Telegram
async function sendTelegramNotification(price, link) {
  const botToken = "YOUR_TELEGRAM_BOT_TOKEN"; // Замените на ваш токен
  const chatId = "YOUR_CHAT_ID"; // Замените на ваш Chat ID
  const message = `⚠️ Diamond found with price $${price}! Check it out: ${link}`;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send Telegram message: ${response.statusText}`);
  }
}
