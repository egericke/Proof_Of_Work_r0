const puppeteer = require('puppeteer');
const Papa = require('papaparse');
const fs = require('fs');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set a realistic user-agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log("Navigating to Garmin login...");
    await page.goto('https://sso.garmin.com/sso/signin', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'scripts/login_before.png' });

    console.log("Waiting for login form...");
    await page.waitForFunction(() => {
      return document.querySelector('form') && document.querySelector('input[type="email"], input[name="username"]');
    }, { timeout: 30000 });

    console.log("Entering credentials...");
    // Dynamically find and fill username field
    const usernameHandle = await page.evaluateHandle(() => {
      return document.querySelector('input[type="email"]') || 
             document.querySelector('input[name="username"]') || 
             document.querySelector('input[autocomplete="username"]');
    });
    if (!usernameHandle) throw new Error("Username field not found.");
    await usernameHandle.type(process.env.GARMIN_USERNAME || '');

    // Dynamically find and fill password field
    const passwordHandle = await page.evaluateHandle(() => {
      return document.querySelector('input[type="password"]') || 
             document.querySelector('input[name="password"]');
    });
    if (!passwordHandle) throw new Error("Password field not found.");
    await passwordHandle.type(process.env.GARMIN_PASSWORD || '');

    // Find and click submit button
    const submitHandle = await page.evaluateHandle(() => {
      return document.querySelector('button[type="submit"]') || 
             document.querySelector('button[data-testid="g__button"]');
    });
    if (!submitHandle) throw new Error("Submit button not found.");
    await submitHandle.click();

    console.log("Waiting for navigation after login...");
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

    // Check for login failure (CAPTCHA, MFA, or still on login page)
    if (page.url().includes('signin') || await page.$('iframe[src*="cdn-cgi"]')) {
      console.error("Login failed: CAPTCHA or MFA detected.");
      await page.screenshot({ path: 'scripts/login_error.png' });
      throw new Error("Login blocked by security features.");
    }
    await page.screenshot({ path: 'scripts/login_after.png' });

    console.log("Navigating to Activities page...");
    await page.goto('https://connect.garmin.com/modern/activities', { waitUntil: 'networkidle0' });

    console.log("Triggering CSV export...");
    const exportButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Export CSV'));
    });
    if (!exportButton) throw new Error("Export CSV button not found.");
    await exportButton.click();

    await page._client().send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: '/tmp',
    });

    // Wait for download with retry logic
    const csvPath = '/tmp/activities.csv';
    let attempts = 0;
    const maxAttempts = 30;
    while (!fs.existsSync(csvPath) && attempts < maxAttempts) {
      await page.waitForTimeout(1000);
      attempts++;
    }
    if (!fs.existsSync(csvPath)) throw new Error("CSV file not downloaded.");

    console.log("Parsing CSV...");
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    // Normalize data (simplified for brevity; expand as needed)
    const normalizedData = parsedData.map(activity => ({
      activity_type: activity['Activity Type'] || null,
      date: activity['Date'] || null,
      distance: activity['Distance'] ? parseFloat(activity['Distance'].replace(' mi', '')) * 1609.34 : null,
      calories: activity['Calories'] ? parseInt(activity['Calories'], 10) : null,
    }));

    fs.writeFileSync('scripts/garmin_data.json', JSON.stringify(normalizedData, null, 2));
    process.stdout.write(JSON.stringify(normalizedData));
    await browser.close();
  } catch (err) {
    console.error("Error:", err.message);
    if (browser) {
      await page.screenshot({ path: 'scripts/error.png' });
      await browser.close();
    }
    process.exit(1);
  }
})();
