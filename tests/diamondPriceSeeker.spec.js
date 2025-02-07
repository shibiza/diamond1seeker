// Импорт библиотек
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Импортируем fetch (если Node.js < 17.5)
import dotenv from "dotenv"; // Импортируем dotenv для переменных окружения

// Загружаем переменные из .env
dotenv.config();

// Основной тест для поиска бриллиантов
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
    const fullLink = `https://www.luvansh.com${link}`; // Полная ссылка

    if (priceText) {
      const price = parseFloat(priceText.replace("$", "").trim());

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

        // Отправка уведомления в Telegram
        await sendTelegramNotification(price, fullLink);
      }
    }
  }

  console.log("✅ Test completed");
});

// Функция для отправки уведомления через Telegram
async function sendTelegramNotification(price, link) {
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
