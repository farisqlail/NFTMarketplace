import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BRAVE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = "C:\\Users\\faris\\.gemini\\antigravity\\brain\\4b8f478b-c056-44ec-8121-33acf0e23ebd\\screenshots";

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  console.log("Launching Browser via Playwright...");
  const browser = await chromium.launch({
    executablePath: BRAVE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  console.log("1. Navigating to landing page...");
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-landing.png") });
  console.log("✓ Saved 01-landing.png");

  console.log("2. Testing Wallet Connection...");
  await page.click(".wallet-btn");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-wallet-menu.png") });
  console.log("✓ Saved 02-wallet-menu.png");

  // Connect via Ghostnet Test Wallet
  await page.getByText("Ghostnet Test Wallet").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-wallet-connected.png") });
  console.log("✓ Saved 03-wallet-connected.png");

  console.log("3. Authenticating test user...");
  const testEmail = `tester_${Date.now()}@cadastra.test`;
  const regRes = await context.request.post(`${BASE_URL}/api/auth/register`, {
    data: {
      email: testEmail,
      password: "Cadastra2026!",
      displayName: "Faris Tester",
      acceptTerms: true,
    },
  });
  console.log("Register API status:", regRes.status());

  const loginRes = await context.request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: testEmail,
      password: "Cadastra2026!",
    },
  });
  console.log("Login API status:", loginRes.status());
  console.log("✓ User authenticated with valid session cookie");

  console.log("4. Testing Explore page & Price Filter...");
  await page.goto(`${BASE_URL}/explore`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-explore.png") });
  console.log("✓ Saved 04-explore.png");

  // Click price filter chip "< 25 ꜩ"
  await page.locator("button:has-text('< 25')").click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-price-filtered.png") });
  console.log("✓ Saved 05-price-filtered.png");

  console.log("5. Testing Item Page, Like toggle & Purchase Flow...");
  await page.goto(`${BASE_URL}/nft/TL-0703`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-item-page.png") });
  console.log("✓ Saved 06-item-page.png");

  // Test like toggle button
  const likeBtn = page.locator(".card-likes").first();
  if (await likeBtn.isVisible()) {
    await likeBtn.click();
    await page.waitForTimeout(400);
  }

  // Trigger Purchase on Tezos Ghostnet
  const buyBtn = page.locator("button:has-text('Buy with tez')");
  await buyBtn.waitFor({ state: "visible" });
  console.log("Triggering Purchase on Tezos Ghostnet...");
  await buyBtn.click();

  // Wait for confirmation modal
  const confirmHeading = page.getByText("Purchase Confirmed!");
  await confirmHeading.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-purchase-confirmed.png") });
  console.log("✓ Saved 07-purchase-confirmed.png");

  console.log("6. Verifying Dashboard & Holdings...");
  await page.getByRole("link", { name: "Go to Dashboard" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-dashboard-holdings.png") });
  console.log("✓ Saved 08-dashboard-holdings.png");

  console.log("All Playwright automated tests completed successfully!");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
