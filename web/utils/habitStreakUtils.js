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
    const end = new Date(endDate);
    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

/**
 * Calculates the current streak, treating missing entries as incomplete.
 * @param {Object[]} entries - Array of habit entries with habit_date and completed properties
 * @param {string} [endDate] - Optional end date (YYYY-MM-DD), defaults to today
 * @returns {number} - Current streak length
 */
export const calculateCurrentStreak = (entries, endDate) => {
    if (!entries || entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => new Date(b.habit_date) - new Date(a.habit_date));
    const checkFromDate = endDate || new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date(checkFromDate);
    let streakBroken = false;

    while (!streakBroken) {
        const dateString = currentDate.toISOString().split('T')[0];
        const entry = sortedEntries.find(e => e.habit_date === dateString);
        if (entry && entry.completed) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            streakBroken = true; // Missing entry or incomplete breaks the streak
        }
    }
    return streak;
};

/**
 * Calculates the best streak across all days in the range.
 * @param {Object[]} entries - Array of habit entries with habit_date and completed properties
 * @returns {number} - Longest streak length
 */
export const calculateBestStreak = (entries) => {
    if (!entries || entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => new Date(a.habit_date) - new Date(b.habit_date));
    const completionMap = {};
    sortedEntries.forEach(entry => {
        completionMap[entry.habit_date] = entry.completed;
    });

    const startDate = new Date(sortedEntries[0].habit_date);
    const endDate = new Date(sortedEntries[sortedEntries.length - 1].habit_date);
    const allDates = getDatesInRange(startDate, endDate);

    let bestStreak = 0;
    let currentStreak = 0;

    allDates.forEach(date => {
        if (completionMap[date] === true) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0; // Missing or incomplete day resets streak
        }
    });

    return bestStreak;
};

/**
 * Generates trend data for the Consistency Trend chart.
 * @param {Object[]} entries - Array of habit entries
 * @param {Date} startDate - Start of the date range
 * @param {Date} endDate - End of the date range
 * @param {number} [windowSize=7] - Moving average window size
 * @returns {Object} - Chart.js-compatible data
 */
export const generateTrendData = (entries, startDate, endDate, windowSize = 7) => {
    const allDates = getDatesInRange(startDate, endDate);
    const completedMap = {};
    entries.forEach(entry => {
        completedMap[entry.habit_date] = entry.completed;
    });

    const completionStatus = allDates.map(date => (completedMap[date] === true ? 1 : 0));
    const labels = [];
    const completionData = [];

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

/**
 * Generates heatmap data for the Monthly View calendar.
 * @param {Object[]} entries - Array of habit entries
 * @param {number} year - Year to display
 * @returns {Object[]} - Array of month objects with day completion status
 */
export const generateHeatmapData = (entries, year) => {
    const months = [];
    const completedMap = {};
    entries.forEach(entry => {
        completedMap[entry.habit_date] = entry.completed;
    });

    for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days[day] = completedMap[dateStr] === true; // True if completed, false otherwise
        }
        months.push({ name: monthName, days });
    }
    return months;
};
