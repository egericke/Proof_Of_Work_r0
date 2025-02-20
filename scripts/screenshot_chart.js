// scripts/screenshot_chart.js
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const activities = JSON.parse(fs.readFileSync('scripts/garmin_data.json', 'utf8'));

    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Daily Workout Proof</h1>
        ${activities.map(activity => `
          <div>
            <p>Date: ${activity.date || 'N/A'}</p>
            <p>Activity: ${activity.activity_type || 'N/A'}</p>
            <p>Distance: ${(parseFloat(activity.distance || 0) / 1609.34).toFixed(2)} mi</p> <!-- Convert meters back to miles for display -->
            <p>Calories: ${activity.calories || 'N/A'}</p>
            <p>Avg HR: ${activity.avg_hr || 'N/A'} bpm</p>
          </div>
        `).join('')}
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
