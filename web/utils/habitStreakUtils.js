// web/utils/habitStreakUtils.js

/**
 * Generates an array of dates between startDate and endDate (inclusive).
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {string[]} - Array of dates in 'YYYY-MM-DD' format
 */
export const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  // Ensure start time is 00:00:00 to avoid timezone issues with comparisons
  currentDate.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  // Add a buffer day to ensure endDate is included reliably
  end.setDate(end.getDate() + 1);

  while (currentDate < end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    // Use UTC dates to avoid timezone shifts affecting the loop
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  return dates;
};

// Removed calculateCurrentStreak and calculateBestStreak
// Logic is now handled within HabitTracker.js useEffect

// generateTrendData and generateHeatmapData remain the same for now,
// although generateHeatmapData is effectively replaced by the logic in HabitTracker.js renderYearlyGrid.
// Keeping them doesn't hurt but they aren't strictly necessary for the current HabitTracker implementation.

/**
 * Generates trend data for the Consistency Trend chart (Optional - can be moved).
 * @param {Object[]} entries - Array of habit entries
 * @param {Date} startDate - Start of the date range
 * @param {Date} endDate - End of the date range
 * @param {number} [windowSize=7] - Moving average window size
 * @returns {Object} - Chart.js-compatible data
 */
export const generateTrendData = (entries, startDate, endDate, windowSize = 7) => {
    // ... (implementation remains the same as previous version if needed) ...
    // Note: This calculation might be better integrated into the main processing
    // hook if complex dependencies arise.
    const allDates = getDatesInRange(startDate, endDate);
    const completedMap = {};
    entries.forEach(entry => {
        // Assuming completion is based on the 80% rule, pre-calculate this map
        // For simplicity here, let's assume entries are already processed daily completion booleans
        // A more robust implementation would take raw data and calculate daily completion here.
        if (entry.isDayCompleted) { // Hypothetical property after pre-processing
             completedMap[entry.habit_date] = true;
        }
    });

    const completionStatus = allDates.map(date => (completedMap[date] === true ? 1 : 0));
    const labels = [];
    const completionData = [];

    if (allDates.length < windowSize) return { labels: [], datasets: [] }; // Not enough data

    for (let i = windowSize - 1; i < allDates.length; i++) {
        const windowStatus = completionStatus.slice(i - windowSize + 1, i + 1);
        const windowRate = (windowStatus.reduce((sum, val) => sum + val, 0) / windowSize) * 100;
        labels.push(allDates[i]);
        completionData.push(windowRate);
    }

     return {
         labels,
         datasets: [
             {
                 label: `${windowSize}-Day Completion Rate (%)`,
                 data: completionData,
                 borderColor: 'rgba(59, 130, 246, 1)',
                 backgroundColor: 'rgba(59, 130, 246, 0.2)',
                 tension: 0.4,
                 fill: true
             }
         ]
     };
};
