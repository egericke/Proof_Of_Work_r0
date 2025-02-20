// scripts/screenshot_chart.js
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    // Get Garmin data
    const garminData = JSON.parse(fs.readFileSync('garmin_data.json', 'utf8')); // Assume main.py saves this

    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Daily Workout Proof</h1>
        <p>Date: ${garminData.date}</p>
        <p>Steps: ${garminData.steps}</p>
        <p>Distance: ${(garminData.distance / 1000).toFixed(2)} km</p>
        <p>Calories: ${garminData.calories}</p>
        <p>Resting HR: ${garminData.resting_hr || 'N/A'}</p>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    await browser.close();
    console.log("Screenshot saved to screenshot.png");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
