// scripts/garmin_scrape.js
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Login
    await page.goto('https://sso.garmin.com/sso/signin', { waitUntil: 'networkidle0' });
    await page.type('#username', process.env.GARMIN_USERNAME);
    await page.type('#password', process.env.GARMIN_PASSWORD);
    await page.click('input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Navigate to daily summary
    const today = new Date().toISOString().split('T')[0];
    await page.goto(`https://connect.garmin.com/modern/daily-summary/${today}`, {
      waitUntil: 'networkidle0',
    });

    // Scrape data (adjust selectors based on actual DOM)
    const data = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText || '0';
      return {
        date: new Date().toISOString().split('T')[0],
        steps: parseInt(getText('.steps .value')?.replace(/[^\d]/g, '')) || 0,
        distance: parseFloat(getText('.distance .value')?.split(' ')[0]) * 1000 || 0, // km to meters
        calories: parseInt(getText('.calories .value')?.replace(/[^\d]/g, '')) || 0,
        resting_hr: parseInt(getText('.resting-hr .value')) || null,
      };
    });

    // Add MET hours (static example; adjust as needed)
    data.met_hours = 10.0 * (45 / 60); // Assuming 45-min run at 10 METs

    console.log(JSON.stringify(data));
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
