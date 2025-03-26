// web/components/ui/IndividualHabitDashboard.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
// Assuming Chart.js is registered globally

const habitColors = { /* ...colors remain the same... */ };

// Utility to generate dates - reuse if available from habitStreakUtils or define locally
const getDatesInRangeLocal = (startDate, endDate) => {
    // ... (same implementation as before) ...
     const dates = [];
     let currentDate = new Date(startDate);
     currentDate.setUTCHours(0, 0, 0, 0);
     const end = new Date(endDate);
     end.setUTCHours(0, 0, 0, 0);
     // No +1 buffer here, we want the exact range for rate calculation
     // end.setDate(end.getDate() + 1);

     while (currentDate <= end) {
         dates.push(currentDate.toISOString().split('T')[0]);
         currentDate.setUTCDate(currentDate.getUTCDate() + 1);
     }
     return dates;
};


export default function IndividualHabitDashboard({ habitName, habitData }) {
  const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompleted: 0, totalPossibleDays: 0 }); // Changed totalAttempted to totalPossibleDays
  const [trendData, setTrendData] = useState({ labels: [], datasets: [] });
  // const [monthlyData, setMonthlyData] = useState([]); // Keep if needed for calendar

  const colorScheme = habitColors[habitName] || habitColors.default;

  useEffect(() => {
    if (!habitData || !habitData.entries || habitData.entries.length === 0) {
        setStats({ currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompleted: 0, totalPossibleDays: 0 });
        setTrendData({ labels: [], datasets: [] });
        // setMonthlyData([]);
        return;
    };

    const sortedEntries = [...habitData.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const completionMap = {}; // { 'YYYY-MM-DD': boolean }
    sortedEntries.forEach(e => { completionMap[e.date] = e.completed });

    // --- Calculate Stats ---
    const firstDateStr = sortedEntries[0].date;
    // ***MODIFICATION START: Determine end date for calculation***
    // Use today if the latest entry is within the current year, otherwise use the latest entry date.
    // This assumes the component is primarily for the current or past years. Adjust if future viewing is needed.
    const lastEntryDate = new Date(sortedEntries[sortedEntries.length - 1].date);
    const today = new Date();
    const isCurrentYear = lastEntryDate.getFullYear() === today.getFullYear();
    const calculationEndDate = isCurrentYear ? today : lastEntryDate;
    const calculationEndDateStr = calculationEndDate.toISOString().split('T')[0];
    // ***MODIFICATION END***

    // Current Streak (logic remains the same, checks back from today)
    let currentStreak = 0;
    let streakCheckDate = new Date(); // Always check back from *today* for current streak
    while (true) {
      const dateStr = streakCheckDate.toISOString().split('T')[0];
      if (completionMap[dateStr] === true) {
        currentStreak++;
        streakCheckDate.setDate(streakCheckDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Best Streak (logic remains the same, uses full range of available data)
    let bestStreak = 0;
    let tempStreak = 0;
    // Iterate through the *actual dates with data* for best streak
    const allDatesWithData = getDatesInRangeLocal(new Date(firstDateStr), new Date(lastEntryDate.toISOString().split('T')[0])); // Use actual last *entry* date
     allDatesWithData.forEach(dateStr => {
         if (completionMap[dateStr] === true) {
             tempStreak++;
         } else {
             bestStreak = Math.max(bestStreak, tempStreak);
             tempStreak = 0; // Reset if day is explicitly false or undefined (missing) in the data range
         }
     });
    bestStreak = Math.max(bestStreak, tempStreak);

    // ***MODIFICATION START: Completion Rate based on possible days***
    // Determine the range for rate calculation: from first entry date to calculationEndDate
    const possibleDaysInRange = getDatesInRangeLocal(new Date(firstDateStr), calculationEndDate);
    const totalPossibleDays = possibleDaysInRange.length;

    // Count completed days within this specific range
    const totalCompleted = possibleDaysInRange.filter(date => completionMap[date] === true).length;

    const completionRate = totalPossibleDays > 0
      ? Math.round((totalCompleted / totalPossibleDays) * 100)
      : 0;
    // ***MODIFICATION END***

    setStats({ currentStreak, bestStreak, completionRate, totalCompleted, totalPossibleDays }); // Pass totalPossibleDays

    // --- Process Trend Data (remains the same, uses dates with data) ---
    const windowSize = 7;
    const labels = [];
    const completionRateData = [];
    // Trend should still be based on the dates data actually exists for
    const trendDates = getDatesInRangeLocal(new Date(firstDateStr), new Date(lastEntryDate.toISOString().split('T')[0]));
    const completionStatus = trendDates.map(date => (completionMap[date] === true ? 1 : 0));

    if (trendDates.length >= windowSize) {
        for (let i = windowSize - 1; i < trendDates.length; i++) {
            const windowStatuses = completionStatus.slice(i - windowSize + 1, i + 1);
            const rate = (windowStatuses.reduce((sum, val) => sum + val, 0) / windowSize) * 100;
            labels.push(trendDates[i]);
            completionRateData.push(rate);
        }
    }
    // ... (rest of trend data setting remains the same)
    setTrendData({
        labels,
        datasets: [ { /* ... */ } ]
    });


  }, [habitData]);

  // ... (chartOptions remain the same) ...
  const chartOptions = { /* ... */ };

  if (!habitData || !habitData.entries || habitData.entries.length === 0) {
      return <p className="text-gray-400 text-center py-4">No data for this habit in the selected period.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Row - Update "Total Completed" display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Current Streak</p><p className="text-xl font-bold">{stats.currentStreak} <span className="text-xs">days</span></p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Best Streak</p><p className="text-xl font-bold">{stats.bestStreak} <span className="text-xs">days</span></p></div>
         <div className="bg-gray-700/50 p-3 rounded"><p className="text-xs text-gray-400">Completion Rate</p><p className="text-xl font-bold">{stats.completionRate}%</p></div>
         {/* MODIFIED Total Completed Display */}
         <div className="bg-gray-700/50 p-3 rounded">
            <p className="text-xs text-gray-400">Total Completed</p>
            <p className="text-xl font-bold">{stats.totalCompleted} <span className="text-xs">/ {stats.totalPossibleDays} days</span></p>
        </div>
         {/* END MODIFIED Display */}
      </div>

      {/* Trend Chart (remains the same) */}
      <div className="bg-gray-700/50 p-3 rounded">
        {/* ... */}
      </div>

      {/* Optional Monthly Heat Map (remains the same) */}
      {/* ... */}
    </div>
  );
}
