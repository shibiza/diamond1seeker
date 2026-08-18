// Импорт библиотек
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv"; 

dotenv.config();

test("check for diamonds with incorrect prices", async ({ page }) => {

  const diamondShapeRound = await page.getByRole('img', { name: 'Round' }).first();
  const colourSliderMin = await page.locator('#colorSlider');
  const colorDragZone = await page.locator('.slider-drag-zone').first();

  const claritySlider = await page.getByTestId("claritySlider");
  const caratMinInputBar = await page.locator(".caratMinInput");
  const caratMaxInputBar = await page.locator(".caratMaxInput");
  const priceBar = await page.locator('#priceMin');
  const cutSlider = await page.locator(".noUI-touch-area");

  const diamondRows = await page.locator(".diamond-row");
  const diamondCount = await diamondRows.count();

  await page.goto("https://www.luvansh.com/shop-diamond");
  await expect(page).toHaveTitle(/Shop Diamonds/);

  if(!diamondShapeRound){
    throw new Error("there are no round diamonds");
  } else {
  await diamondShapeRound.click();
  }

  const colourBox = await colorDragZone.boundingBox();
  if(!colourBox){
  throw new Error("Slider drag zone was not found");
  }  
 // await page.mouse.move(colourBox)


  await expect(caratMinInputBar).toBeVisible();
  await expect(caratMaxInputBar).toBeVisible();

  await caratMinInputBar.fill("1");
  console.log("choosing stones with min 1 carat weight");
  await caratMaxInputBar.fill("1.5");
  console.log("max weight is 1.5 carats now");
  

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
