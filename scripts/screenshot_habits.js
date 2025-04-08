// scripts/screenshot_habits.js
const puppeteer = require('puppeteer');
const path = require('path');

const HABITS_PAGE_URL = 'http://localhost:3000/habits'; // Target locally running server
const SCREENSHOT_SELECTOR = '#habits-panel-container'; // Target the specific panel
const OUTPUT_PATH = path.join(__dirname, 'habit_screenshot.png'); // Save in scripts directory
const VIEWPORT_WIDTH = 1200; // Wider viewport for better layout
const VIEWPORT_HEIGHT = 900;

(async () => {
  let browser;
  console.log(`Starting screenshot script for URL: ${HABITS_PAGE_URL}`);
  console.log(`Target selector: ${SCREENSHOT_SELECTOR}`);
  console.log(`Output path: ${OUTPUT_PATH}`);

  try {
    browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Recommended for CI environments
        '--font-render-hinting=none' // Improve font rendering consistency
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

    console.log(`Navigating to ${HABITS_PAGE_URL}...`);
    // Increase navigation timeout and wait until network is idle
    await page.goto(HABITS_PAGE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('Page loaded.');

    console.log(`Waiting for selector "${SCREENSHOT_SELECTOR}"...`);
    // Wait for the specific element and ensure it's fully rendered
    await page.waitForSelector(SCREENSHOT_SELECTOR, { visible: true, timeout: 30000 });
    console.log('Selector found.');

    // Optional: Wait a tiny bit more for animations/renders to settle
    await page.waitForTimeout(1000);

    const element = await page.$(SCREENSHOT_SELECTOR);
    if (!element) {
      throw new Error(`Element with selector "${SCREENSHOT_SELECTOR}" not found.`);
    }
    console.log('Element located, taking screenshot...');

    await element.screenshot({ path: OUTPUT_PATH });
    console.log(`Screenshot saved successfully to ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('Error during screenshot process:', error);
    // Try taking a full page screenshot for debugging if element fails
    if (page) {
      try {
        const debugPath = path.join(__dirname, 'debug_screenshot_error.png');
        console.log(`Attempting debug screenshot to ${debugPath}`);
        await page.screenshot({ path: debugPath, fullPage: true });
        console.log(`Debug screenshot saved.`);
      } catch (debugError) {
        console.error('Failed to take debug screenshot:', debugError);
      }
    }
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed.');
    }
  }
})();
