// web/components/ui/IndividualHabitDashboard.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
// Assuming Chart.js is registered globally in _app.js or similar
// No need to re-register scales etc. here if done globally

// Color definitions (consistent with HabitCard/StatsCard if possible)
const habitColors = {
    // Example colors - customize as needed
    'Meditation': { border: 'rgba(59, 130, 246, 1)', secondary: 'rgba(59, 130, 246, 0.2)' },
    'Exercise': { border: 'rgba(16, 185, 129, 1)', secondary: 'rgba(16, 185, 129, 0.2)' },
    'Reading': { border: 'rgba(139, 92, 246, 1)', secondary: 'rgba(139, 92, 246, 0.2)' },
    'Journaling': { border: 'rgba(245, 158, 11, 1)', secondary: 'rgba(245, 158, 11, 0.2)' },
    'Cold Plunge': { border: 'rgba(14, 165, 233, 1)', secondary: 'rgba(14, 165, 233, 0.2)' },
    'default': { border: 'rgba(156, 163, 175, 1)', secondary: 'rgba(156, 163, 175, 0.2)' } // gray
};

// Utility to generate dates - reuse if available from habitStreakUtils
const getDatesInRangeLocal = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    currentDate.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // Include end date

    while (currentDate < end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return dates;
};


export default function IndividualHabitDashboard({ habitName, habitData }) {
  const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompleted: 0, totalAttempted: 0 });
  const [trendData, setTrendData] = useState({ labels: [], datasets: [] });
  const [monthlyData, setMonthlyData] = useState([]); // For potential future calendar view

  const colorScheme = habitColors[habitName] || habitColors.default;

  useEffect(() => {
    if (!habitData || !habitData.entries || habitData.entries.length === 0) {
        // Handle empty data case
        setStats({ currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompleted: 0, totalAttempted: 0 });
        setTrendData({ labels: [], datasets: [] });
        setMonthlyData([]);
        return;
    };

    // Sort entries by date
    const sortedEntries = [...habitData.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const completionMap = {}; // { 'YYYY-MM-DD': boolean }
    sortedEntries.forEach(e => { completionMap[e.date] = e.completed });

    // --- Calculate Stats ---
    const today = new Date().toISOString().split('T')[0];
    const firstDateStr = sortedEntries[0].date;
    const lastDateStr = sortedEntries[sortedEntries.length - 1].date;

    // Current Streak
    let currentStreak = 0;
    let streakDate = new Date(); // Start from today
    while (true) {
      const dateStr = streakDate.toISOString().split('T')[0];
      if (completionMap[dateStr] === true) {
        currentStreak++;
        streakDate.setDate(streakDate.getDate() - 1);
      } else {
        break; // Streak broken if false or undefined
      }
    }

    // Best Streak (iterate through the actual date range of the data)
    let bestStreak = 0;
    let tempStreak = 0;
    const allDatesInRange = getDatesInRangeLocal(new Date(firstDateStr), new Date(lastDateStr));
    allDatesInRange.forEach(dateStr => {
        if (completionMap[dateStr] === true) {
            tempStreak++;
        } else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 0;
        }
    });
    bestStreak = Math.max(bestStreak, tempStreak); // Final check

    // Completion Rate
    const totalAttempted = sortedEntries.length; // Based on actual entries for this habit
    const totalCompleted = sortedEntries.filter(e => e.completed).length;
    const completionRate = totalAttempted > 0
      ? Math.round((totalCompleted / totalAttempted) * 100)
      : 0;

    setStats({ currentStreak, bestStreak, completionRate, totalCompleted, totalAttempted });

    // --- Process Trend Data (7-day moving average) ---
    const windowSize = 7;
    const labels = [];
    const completionRateData = [];
    const completionStatus = allDatesInRange.map(date => (completionMap[date] === true ? 1 : 0));

    if (allDatesInRange.length >= windowSize) {
        for (let i = windowSize - 1; i < allDatesInRange.length; i++) {
            const windowStatuses = completionStatus.slice(i - windowSize + 1, i + 1);
            const rate = (windowStatuses.reduce((sum, val) => sum + val, 0) / windowSize) * 100;
            labels.push(allDatesInRange[i]);
            completionRateData.push(rate);
        }
    }

    setTrendData({
      labels,
      datasets: [
        {
          label: '7-Day Completion Rate (%)',
          data: completionRateData,
          borderColor: colorScheme.border,
          backgroundColor: colorScheme.secondary,
          tension: 0.3,
          fill: true,
        }
      ]
    });

    // --- Process Monthly Data (Optional for future calendar) ---
    // ... (logic to create monthly heatmap data structure if needed) ...

  }, [habitData]); // Rerun when habitData changes

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };

  // Prevent rendering if no data (already handled in parent)
  if (!habitData || !habitData.entries || habitData.entries.length === 0) {
      return <p className="text-gray-400 text-center py-4">No data for this habit in the selected period.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Current Streak</p><p className="text-xl font-bold">{stats.currentStreak} <span className="text-xs">days</span></p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Best Streak</p><p className="text-xl font-bold">{stats.bestStreak} <span className="text-xs">days</span></p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Completion Rate</p><p className="text-xl font-bold">{stats.completionRate}%</p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Total Completed</p><p className="text-xl font-bold">{stats.totalCompleted}/{stats.totalAttempted}</p></div>
      </div>

      {/* Trend Chart */}
      <div className="bg-gray-700/50 p-3 rounded">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Consistency Trend (7-Day Avg)</h4>
        <div className="h-48"> {/* Adjust height as needed */}
          {trendData.labels.length > 0 ? (
            <Line data={trendData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Not enough data for trend.</div>
          )}
        </div>
      </div>

      {/* Optional: Monthly Heat Map for this specific habit */}
      {/* <div className="bg-gray-700/50 p-3 rounded">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Monthly View</h4>
        {monthlyData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {monthlyData.map(month => renderHeatMap(month))} // Need renderHeatMap function adapted
            </div>
        ) : ( <p className="text-gray-400 text-center py-4">No monthly data.</p>)}
      </div> */}
    </div>
  );
}
