// scripts/garmin_scrape.js
const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    console.log("Navigating to Garmin login...");
    await page.goto('https://sso.garmin.com/sso/signin', { waitUntil: 'networkidle0' });

    console.log("Entering credentials...");
    await page.type('#username', process.env.GARMIN_USERNAME || '');
    await page.type('#password', process.env.GARMIN_PASSWORD || '');
    await page.click('input[type="submit"]');

    console.log("Waiting for navigation after login...");
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

    // Check if login succeeded
    if (page.url().includes('signin')) {
      console.error("Login failed: Still on signin page. Possible CAPTCHA or MFA.");
      await page.screenshot({ path: 'login_error.png' });
      process.exit(1);
    }

    console.log("Navigating to daily summary...");
    const today = new Date().toISOString().split('T')[0];
    await page.goto(`https://connect.garmin.com/modern/daily-summary/${today}`, {
      waitUntil: 'networkidle0',
    });

    console.log("Scraping data...");
    const data = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText || '0';
      return {
        date: new Date().toISOString().split('T')[0],
        steps: parseInt(getText('[data-testid="steps"]')?.replace(/[^\d]/g, '')) || 0,
        distance: parseFloat(getText('[data-testid="distance"]')?.split(' ')[0]) * 1000 || 0, // km to meters
        calories: parseInt(getText('[data-testid="calories"]')?.replace(/[^\d]/g, '')) || 0,
        resting_hr: parseInt(getText('[data-testid="restingHeartRate"]')) || null,
      };
    });

    data.met_hours = 10.0 * (45 / 60); // Static example
    console.log("Data scraped:", JSON.stringify(data));
    await browser.close();
    process.stdout.write(JSON.stringify(data)); // Ensure output for main.py
  } catch (err) {
    console.error("Error:", err.message);
    if (browser) {
      const page = await browser.newPage();
      await page.screenshot({ path: 'error.png' });
      await browser.close();
    }
    process.exit(1);
  }
})();
