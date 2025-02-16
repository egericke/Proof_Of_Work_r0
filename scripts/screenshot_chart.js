// scripts/screenshot_chart.js
/**
 * Puppeteer script to screenshot the Next.js dashboard.
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

    // Wait for chart or any known selector
    await page.waitForSelector('canvas');
    await page.screenshot({ path: 'screenshot.png', fullPage: false });

    await browser.close();
    console.log("Screenshot saved to screenshot.png");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
