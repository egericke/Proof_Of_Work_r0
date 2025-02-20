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
    // Use the correct selector based on the provided HTML
    const usernameSelector = '#email'; // Updated from #username to id="email"
    const passwordSelector = '#password'; // Assume password uses id="password"; adjust if needed
    const submitSelector = 'input[type="submit"]'; // May need adjustment

    // Wait for and type credentials
    await page.waitForSelector(usernameSelector, { timeout: 5000 });
    await page.type(usernameSelector, process.env.GARMIN_USERNAME || '');
    await page.type(passwordSelector, process.env.GARMIN_PASSWORD || '');
    await page.click(submitSelector);

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

    // Set download behavior and wait for download
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: '/tmp',
    });
    await page.waitForTimeout(5000); // Adjust delay as needed

    // Assume the CSV is downloaded to /tmp/activities.csv
    const csvPath = '/tmp/activities.csv';
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

    // Clean and normalize data (e.g., handle empty strings, convert units)
    const normalizedData = parsedData.map(activity => {
      return {
        activity_type: activity['Activity Type'] || null,
        date: activity['Date'] || null,
        favorite: activity['Favorite'] === 'TRUE',
        title: activity['Title'] || null,
        distance: activity['Distance'] ? parseFloat(activity['Distance'].replace(' mi', '')) * 1609.34 : null, // Convert miles to meters
        calories: activity['Calories'] ? parseInt(activity['Calories'], 10) : null,
        time: activity['Time'] || null, // Store as string, convert later if needed
        avg_hr: activity['Avg HR'] ? parseInt(activity['Avg HR'], 10) : null,
        max_hr: activity['Max HR'] ? parseInt(activity['Max HR'], 10) : null,
        avg_bike_cadence: activity['Avg Bike Cadence'] ? parseInt(activity['Avg Bike Cadence'], 10) : null,
        max_bike_cadence: activity['Max Bike Cadence'] ? parseInt(activity['Max Bike Cadence'], 10) : null,
        avg_speed: activity['Avg Speed'] || null, // Store as string (e.g., "X mph"), convert later
        max_speed: activity['Max Speed'] || null,
        total_ascent: activity['Total Ascent'] ? parseInt(activity['Total Ascent'], 10) : null,
        total_descent: activity['Total Descent'] ? parseInt(activity['Total Descent'], 10) : null,
        avg_stride_length: activity['Avg Stride Length'] ? parseFloat(activity['Avg Stride Length'].replace(' ft', '')) * 0.3048 : null, // Convert feet to meters
        training_stress_score: activity['Training Stress ScoreÂ®'] ? parseFloat(activity['Training Stress ScoreÂ®']) : null,
        total_strokes: activity['Total Strokes'] ? parseInt(activity['Total Strokes'], 10) : null,
        avg_swolf: activity['Avg. Swolf'] ? parseInt(activity['Avg. Swolf'], 10) : null,
        avg_stroke_rate: activity['Avg Stroke Rate'] ? parseInt(activity['Avg Stroke Rate'], 10) : null,
        steps: activity['Steps'] ? parseInt(activity['Steps'], 10) : null,
        total_reps: activity['Total Reps'] ? parseInt(activity['Total Reps'], 10) : null,
        total_sets: activity['Total Sets'] ? parseInt(activity['Total Sets'], 10) : null,
        min_temp: activity['Min Temp'] ? parseFloat(activity['Min Temp'].replace('°F', '')) : null, // Convert °F to °C if needed: (°F - 32) * 5/9
        decompression: activity['Decompression'] || null,
        best_lap_time: activity['Best Lap Time'] || null,
        number_of_laps: activity['Number of Laps'] ? parseInt(activity['Number of Laps'], 10) : null,
        max_temp: activity['Max Temp'] ? parseFloat(activity['Max Temp'].replace('°F', '')) : null, // Convert °F to °C if needed
        moving_time: activity['Moving Time'] || null,
        elapsed_time: activity['Elapsed Time'] || null,
        min_elevation: activity['Min Elevation'] ? parseFloat(activity['Min Elevation'].replace(' ft', '')) * 0.3048 : null, // Convert feet to meters
        max_elevation: activity['Max Elevation'] ? parseFloat(activity['Max Elevation'].replace(' ft', '')) * 0.3048 : null, // Convert feet to meters
      };
    });

    // Save data for screenshot_chart.js
    fs.writeFileSync('garmin_data.json', JSON.stringify(normalizedData, null, 2));
    console.log("Normalized data saved to garmin_data.json:", JSON.stringify(normalizedData));
    process.stdout.write(JSON.stringify(normalizedData)); // Output for main.py
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
