// Подключаем библиотеку dotenv
require("dotenv").config();

// Импортируем класс Bot из библиотеки grammy
const { Bot } = require("grammy");

// Создаём экземпляр бота с токеном из .env
const bot = new Bot(process.env.BOT_TOKEN);

// Обрабатываем команду /start
bot.command("start", async (ctx) => {
  await ctx.reply("Привет! Я - Бот 🤖");
});

// Обрабатываем любые другие сообщения
bot.on("message", async (ctx) => {
  await ctx.reply("Надо подумать... жизнь прекрасна!");
});

// Запускаем бота
bot.start();
