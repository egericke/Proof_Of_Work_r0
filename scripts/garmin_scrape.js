// scripts/garmin_scrape.js
const puppeteer = require('puppeteer');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

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

    console.log("Navigating to Activities page...");
    await page.goto('https://connect.garmin.com/modern/activities', {
      waitUntil: 'networkidle0',
    });

    console.log("Triggering CSV export...");
    // Find and click the "Export CSV" button (adjust selector based on inspection)
    const exportButton = await page.waitForSelector('.export-csv-btn'); // Example; update with actual class/ID
    if (!exportButton) throw new Error("Export CSV button not found.");
    await exportButton.click();

    // Wait for download to complete (Puppeteer doesn’t directly handle downloads; use a workaround)
    await page.waitForTimeout(5000); // Adjust delay as needed

    // Assume the CSV is downloaded to a default location (e.g., /tmp in GitHub Actions)
    const csvPath = '/tmp/activities.csv'; // Adjust based on GitHub Actions download location
    if (!fs.existsSync(csvPath)) {
      console.error("CSV file not found. Check export process.");
      await page.screenshot({ path: 'export_error.png' });
      process.exit(1);
    }

    console.log("Parsing CSV...");
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => result.data,
    });

    console.log("CSV parsed:", JSON.stringify(parsedData));
    process.stdout.write(JSON.stringify(parsedData)); // Output for main.py
    await browser.close();
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
