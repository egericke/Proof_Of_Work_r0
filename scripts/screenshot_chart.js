// scripts/screenshot_chart.js
const puppeteer = require('puppeteer');

(async () => {
  try {
    const url = process.env.DASHBOARD_URL || 'https://your-dashboard-url.com'; // Set this!
    if (!url) throw new Error('DASHBOARD_URL not set in environment.');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.waitForSelector('canvas');
    await page.screenshot({ path: 'screenshot.png', fullPage: false });

    await browser.close();
    console.log("Screenshot saved to screenshot.png");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
