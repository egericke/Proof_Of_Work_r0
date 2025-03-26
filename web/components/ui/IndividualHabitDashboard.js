// web/components/ui/IndividualHabitDashboard.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { getDatesInRange } from '../../utils/habitStreakUtils'; // Ensure this utility is correct

// Color definitions
const habitColors = {
    'Meditation': { border: 'rgba(59, 130, 246, 1)', secondary: 'rgba(59, 130, 246, 0.2)' },
    'Exercise': { border: 'rgba(16, 185, 129, 1)', secondary: 'rgba(16, 185, 129, 0.2)' },
    'Reading': { border: 'rgba(139, 92, 246, 1)', secondary: 'rgba(139, 92, 246, 0.2)' },
    'Journaling': { border: 'rgba(245, 158, 11, 1)', secondary: 'rgba(245, 158, 11, 0.2)' },
    'Cold Plunge': { border: 'rgba(14, 165, 233, 1)', secondary: 'rgba(14, 165, 233, 0.2)' },
    'default': { border: 'rgba(156, 163, 175, 1)', secondary: 'rgba(156, 163, 175, 0.2)' } // gray
};

export default function IndividualHabitDashboard({ habitName, habitData }) {
  // State: totalAttemptedDays counts days from first entry to last entry/today
  const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompleted: 0, totalAttemptedDays: 0 });
  const [trendData, setTrendData] = useState({ labels: [], datasets: [] });

  const colorScheme = habitColors[habitName] || habitColors.default;

  useEffect(() => {
    // Reset state when data is empty or loading
    if (!habitData || !habitData.entries || habitData.entries.length === 0) {
        setStats({ currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompleted: 0, totalAttemptedDays: 0 });
        setTrendData({ labels: [], datasets: [] });
        return;
    };

    // Sort entries by date - essential for calculations
    const sortedEntries = [...habitData.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const completionMap = {}; // { 'YYYY-MM-DD': boolean }
    sortedEntries.forEach(e => { completionMap[e.date] = e.completed });

    // --- Calculate Stats ---
    const firstDateStr = sortedEntries[0].date;
    const lastDateStrInData = sortedEntries[sortedEntries.length - 1].date;

    // Determine the timespan: from the first entry date up to the later of (last entry date, today)
    const habitStartDate = new Date(firstDateStr);
    habitStartDate.setUTCHours(0, 0, 0, 0); // Normalize

    let habitEndDate = new Date(lastDateStrInData);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize

    if (habitEndDate < today) {
        habitEndDate = new Date(today); // Use today if data is older
    }
    habitEndDate.setUTCHours(0, 0, 0, 0); // Normalize

    // Calculate the number of days in the habit's actual tracked timespan
    const allDatesInHabitRange = getDatesInRange(habitStartDate, habitEndDate); // Use utility
    const totalAttemptedDays = allDatesInHabitRange.length > 0 ? allDatesInHabitRange.length : 1;


    // Current Streak (Counts backwards from today)
    let currentStreak = 0;
    let streakCheckDate = new Date(); // Start from today
     streakCheckDate.setUTCHours(0, 0, 0, 0); // Normalize
    while (true) {
      const dateStr = streakCheckDate.toISOString().split('T')[0];
       if (streakCheckDate < habitStartDate) break; // Stop if we go before the habit started
      if (completionMap[dateStr] === true) { // Check map for completion
        currentStreak++;
        streakCheckDate.setUTCDate(streakCheckDate.getUTCDate() - 1); // Use UTC date logic
      } else {
        break; // Streak broken if false or undefined (meaning not tracked/completed)
      }
    }

    // Best Streak (Iterates through the entire relevant timespan using the generated date range)
    let bestStreak = 0;
    let tempStreak = 0;
    allDatesInHabitRange.forEach(dateStr => {
        if (completionMap[dateStr] === true) { // Check map for completion status
            tempStreak++;
        } else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 0; // Reset if day is missing or incomplete in map
        }
    });
    bestStreak = Math.max(bestStreak, tempStreak); // Final check

    // Completion Rate (Uses the calculated timespan)
    const totalCompleted = sortedEntries.filter(e => e.completed).length;
    const completionRate = totalAttemptedDays > 0
      ? Math.round((totalCompleted / totalAttemptedDays) * 100) // Denominator is timespan
      : 0;

    setStats({
        currentStreak,
        bestStreak,
        completionRate, // Updated calculation
        totalCompleted,
        totalAttemptedDays // Use the new name
    });

    // --- Process Trend Data (7-day moving average) ---
    const windowSize = 7;
    const labels = [];
    const completionRateData = [];

    if (allDatesInHabitRange.length >= windowSize) {
        // Create status array based on the *full date range*, using the map
        const completionStatus = allDatesInHabitRange.map(date => (completionMap[date] === true ? 1 : 0));

        for (let i = windowSize - 1; i < allDatesInHabitRange.length; i++) {
            const windowStatuses = completionStatus.slice(i - windowSize + 1, i + 1);
            // Calculate rate based on the window (7 days)
            const rate = (windowStatuses.reduce((sum, val) => sum + val, 0) / windowSize) * 100;
            labels.push(allDatesInHabitRange[i]);
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

  }, [habitData, habitName]);

  // Chart options
  const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: false },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      return `Completion rate: ${context.parsed.y.toFixed(1)}%`; // Format tooltip
                  }
              }
          }
      },
      scales: {
          y: { min: 0, max: 100, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
          x: { ticks: { color: '#9ca3af', autoSkip: true, maxTicksLimit: 10, maxRotation: 45, minRotation: 0 }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      }
  };

  // Render
  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Current Streak</p><p className="text-xl font-bold">{stats.currentStreak} <span className="text-xs">days</span></p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Best Streak</p><p className="text-xl font-bold">{stats.bestStreak} <span className="text-xs">days</span></p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Completion Rate</p><p className="text-xl font-bold">{stats.completionRate}%</p></div>
         {/* Updated Total Completed Card */}
         <div className="bg-gray-700/50 p-3 rounded">
             <p className="text-xs text-gray-400">Total Completed</p>
             <p className="text-xl font-bold">
                 {stats.totalCompleted} / {stats.totalAttemptedDays}
                 <span className="text-xs ml-1">days</span>
             </p>
         </div>
      </div>

      {/* Trend Chart */}
       <div className="bg-gray-700/50 p-3 rounded">
         <h4 className="text-sm font-medium text-gray-300 mb-2">Consistency Trend (7-Day Avg)</h4>
         <div className="h-48">
           {trendData.labels.length > 0 ? (
             <Line data={trendData} options={chartOptions} />
           ) : (
             // *** FIX: Escape the '>' symbol ***
             <div className="flex items-center justify-center h-full text-gray-400">Not enough data for trend (need &gt;7 days).</div>
           )}
         </div>
       </div>
    </div>
  );
}
