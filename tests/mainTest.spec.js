// @ts-check
import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://www.luvansh.com/shop-diamond");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Shop Lab Diamonds/);

  const caratBar = await page.locator("#txtminWeight");

  if (await caratBar.isVisible()) {
    await caratBar.fill("2");
    console.log("😊  stone weight is now 2 carats and more");
  } else {
    throw new Error("💀 carat bar is not found!");
  }

  //all links have same class LC20lb :
  //<h3 class="LC20lb MBeuO DKV0Md">Installation | Playwright</h3>
  // await page.waitForSelector(".LC20lb");
  // let linksNames = await page.locator(".LC20lb").allInnerTexts(); //Promise<Array<string>> - we extract names of all links

  //console.log(" ✅ names of links are: ", linksNames);

  // expect(linksNames).toContain("Installation | Playwright");
});
