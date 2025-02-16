// scripts/screenshot_chart.js
/**
 * Puppeteer script to screenshot the Next.js dashboard.
 * Make sure to install Puppeteer in this folder if used separately,
 * or in the main 'web' package.json if you prefer.
 */
const puppeteer = require('puppeteer');

(async () => {
  try {
    const url = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for chart or known selector
    await page.waitForSelector('canvas');
    await page.screenshot({ path: 'screenshot.png', fullPage: false });

    await browser.close();
    console.log("Screenshot saved to screenshot.png");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
