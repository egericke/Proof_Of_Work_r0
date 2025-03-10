// web/utils/habitStreakUtils.js

/**
 * Calculates the current streak for a habit based on completion data
 * 
 * @param {Array} entries - Array of habit entries with date and completed properties
 * @param {String} endDate - Optional end date string (YYYY-MM-DD) to calculate streak from, defaults to today
 * @returns {Number} - The current streak count
 */
export const calculateCurrentStreak = (entries, endDate) => {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Default to today if no end date provided
  const checkFromDate = endDate || new Date().toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(checkFromDate);
  let streakBroken = false;
  
  while (!streakBroken) {
    const dateString = currentDate.toISOString().split('T')[0];
    const entry = sortedEntries.find(e => e.date === dateString);
    
    if (entry && entry.completed) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      streakBroken = true;
    }
  }
  
  return streak;
};

/**
 * Calculates the best streak for a habit based on completion data
 * 
 * @param {Array} entries - Array of habit entries with date and completed properties
 * @returns {Number} - The best streak count
 */
export const calculateBestStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by date (oldest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  let bestStreak = 0;
  let currentStreak = 0;
  
  // Create a map for faster lookups
  const completionMap = {};
  sortedEntries.forEach(entry => {
    completionMap[entry.date] = entry.completed;
  });
  
  // Get all dates in range
  const startDate = new Date(sortedEntries[0].date);
  const endDate = new Date(sortedEntries[sortedEntries.length - 1].date);
  const allDates = [];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Iterate through all dates to calculate streaks
  allDates.forEach(date => {
    if (completionMap[date]) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return bestStreak;
};

/**
 * Generates a heatmap of habit completion data
 * 
 * @param {Array} entries - Array of habit entries with date and completed properties
 * @param {Number} year - Year to generate heatmap for
 * @returns {Object} - Heatmap data organized by month
 */
export const generateHeatmapData = (entries, year) => {
  if (!entries || entries.length === 0) return [];
  
  // Filter entries for the specified year
  const yearEntries = entries.filter(entry => {
    const entryYear = new Date(entry.date).getFullYear();
    return entryYear === year;
  });
  
  // Group by month
  const months = {};
  yearEntries.forEach(entry => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!months[monthKey]) {
      months[monthKey] = {
        name: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        days: {}
      };
    }
    
    months[monthKey].days[date.getDate()] = entry.completed;
  });
  
  return Object.values(months);
};

/**
 * Generates trend data for habit completion
 * 
 * @param {Array} entries - Array of habit entries with date and completed properties
 * @param {Number} windowSize - Size of the moving window for calculating trend (default: 7 days)
 * @returns {Object} - Chart.js compatible dataset with labels and data
 */
export const generateTrendData = (entries, windowSize = 7) => {
  if (!entries || entries.length < windowSize) {
    return { labels: [], datasets: [] };
  }
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  const labels = [];
  const completionData = [];
  
  // Calculate moving average
  for (let i = windowSize - 1; i < sortedEntries.length; i++) {
    const windowEntries = sortedEntries.slice(i - (windowSize - 1), i + 1);
    const windowCompleted = windowEntries.filter(e => e.completed).length;
    const windowRate = Math.round((windowCompleted / windowSize) * 100);
    
    labels.push(sortedEntries[i].date);
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
 * Helper function to get streak ranges for visualization
 * 
 * @param {Array} entries - Array of habit entries with date and completed properties
 * @returns {Array} - Array of streak objects with start, end and length properties
 */
export const getStreakRanges = (entries) => {
  if (!entries || entries.length === 0) return [];
  
  // Sort entries by date (oldest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  const streaks = [];
  let currentStreak = null;
  
  // Create a map for faster lookups
  const completionMap = {};
  sortedEntries.forEach(entry => {
    completionMap[entry.date] = entry.completed;
  });
  
  // Get all dates in range
  const startDate = new Date(sortedEntries[0].date);
  const endDate = new Date(sortedEntries[sortedEntries.length - 1].date);
  const allDates = [];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Iterate through all dates to identify streaks
  allDates.forEach(date => {
    if (completionMap[date]) {
      // Continuing or starting a streak
      if (currentStreak) {
        // Continue streak
        currentStreak.end = date;
        currentStreak.length++;
      } else {
        // Start new streak
        currentStreak = {
          start: date,
          end: date,
          length: 1
        };
      }
    } else {
      // End of streak
      if (currentStreak) {
        streaks.push(currentStreak);
        currentStreak = null;
      }
    }
  });
  
  // Don't forget to add the last streak if we ended on one
  if (currentStreak) {
    streaks.push(currentStreak);
  }
  
  return streaks;
};

/**
 * Helper function to get color for habit based on name
 * 
 * @param {String} habitName - Name of the habit
 * @returns {Object} - Color scheme object with primary, secondary and border colors
 */
export const getHabitColorScheme = (habitName) => {
  const colorMap = {
    'Meditation': {
      primary: 'rgba(59, 130, 246, 0.8)', // blue
      secondary: 'rgba(59, 130, 246, 0.2)',
      border: 'rgba(59, 130, 246, 1)'
    },
    'Exercise': {
      primary: 'rgba(16, 185, 129, 0.8)', // green
      secondary: 'rgba(16, 185, 129, 0.2)',
      border: 'rgba(16, 185, 129, 1)'
    },
    'Reading': {
      primary: 'rgba(139, 92, 246, 0.8)', // purple
      secondary: 'rgba(139, 92, 246, 0.2)',
      border: 'rgba(139, 92, 246, 1)'
    },
    'Journaling': {
      primary: 'rgba(245, 158, 11, 0.8)', // amber
      secondary: 'rgba(245, 158, 11, 0.2)',
      border: 'rgba(245, 158, 11, 1)'
    },
    'Cold Plunge': {
      primary: 'rgba(14, 165, 233, 0.8)', // sky
      secondary: 'rgba(14, 165, 233, 0.2)',
      border: 'rgba(14, 165, 233, 1)'
    }
  };
  
  return colorMap[habitName] || {
    primary: 'rgba(156, 163, 175, 0.8)', // gray (default)
    secondary: 'rgba(156, 163, 175, 0.2)',
    border: 'rgba(156, 163, 175, 1)'
  };
};
