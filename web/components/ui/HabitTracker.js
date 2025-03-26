// web/components/ui/HabitTracker.js
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabaseClient';
import { calculateCurrentStreak, calculateBestStreak } from '../../utils/habitStreakUtils'; // Assuming these are refined
import 'react-tooltip/dist/react-tooltip.css'; // Import tooltip CSS
import { Tooltip } from 'react-tooltip'; // Import Tooltip component

// Define colors for the grid cells
const cellColors = {
  completed: 'bg-blue-500',     // Day met completion criteria (e.g., >= 80%)
  incomplete: 'bg-gray-600',   // Data exists, but criteria not met
  noData: 'bg-gray-800',        // No data for this day
  todayRing: 'ring-2 ring-white', // Outline for today
};

// Define stats card colors and icons
const statsConfig = {
  currentStreak: { color: 'blue', icon: 'flame' },
  bestStreak: { color: 'amber', icon: 'trophy' },
  doneInMonth: { color: 'green', icon: 'list-check' },
  overallRate: { color: 'purple', icon: 'percent' }
};

/**
 * HabitTracker component displays a yearly habit grid and stats.
 * Fetches data for the selected year and calculates completion based on daily habit entries.
 * @param {Object} props - Component props
 * @param {Object} props.dateRange - Global date range (used for initial context, but fetches by year)
 */
export default function HabitTracker({ dateRange }) {
  // State variables
  const [year, setYear] = useState(dateRange.endDate.getFullYear()); // Initialize year from dateRange
  const [completionMap, setCompletionMap] = useState({}); // { 'YYYY-MM-DD': boolean } - true if day is >= 80% complete
  const [rawData, setRawData] = useState([]); // Store raw fetched data
  const [habitStats, setHabitStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    doneInMonth: 0, // Completions in the *current* month of the selected year
    overallRate: 0, // Completion rate for the selected year
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching and Processing Effect ---
  useEffect(() => {
    async function fetchAndProcessHabits() {
      setIsLoading(true);
      setError(null);
      setCompletionMap({}); // Clear previous data
      setRawData([]);

      try {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase client not available');

        // Fetch habits for the entire selected year
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        console.log(`HabitTracker: Fetching habits for ${year} (${startDate} to ${endDate})`);

        const { data, error: fetchError } = await supabase
          .from('habit_tracking')
          .select('habit_date, completed') // Select only necessary columns
          .gte('habit_date', startDate)
          .lte('habit_date', endDate)
          .order('habit_date', { ascending: true });

        if (fetchError) throw fetchError;
        console.log(`HabitTracker: Fetched ${data?.length || 0} habit entries for ${year}.`);

        if (!data || data.length === 0) {
          // Handle case with no data for the year
          setHabitStats({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });
          setIsLoading(false);
          return;
        }

        setRawData(data); // Store raw data if needed elsewhere

        // --- Process Data ---
        const habitsByDate = {}; // { 'YYYY-MM-DD': { total: N, completed: M } }
        data.forEach(habit => {
          const date = habit.habit_date;
          if (!habitsByDate[date]) {
            habitsByDate[date] = { total: 0, completed: 0 };
          }
          habitsByDate[date].total++;
          if (habit.completed) {
            habitsByDate[date].completed++;
          }
        });

        // Create completion map (day is completed if >= 80% habits done)
        const newCompletionMap = {};
        let totalCompletedDays = 0;
        Object.keys(habitsByDate).forEach(date => {
          const dayData = habitsByDate[date];
          const isDayCompleted = dayData.total > 0 && (dayData.completed / dayData.total) >= 0.8;
          newCompletionMap[date] = isDayCompleted;
          if (isDayCompleted) {
            totalCompletedDays++;
          }
        });
        setCompletionMap(newCompletionMap);
        console.log(`HabitTracker: Processed completion map for ${Object.keys(newCompletionMap).length} days.`);

        // --- Calculate Stats ---
        const todayStr = new Date().toISOString().split('T')[0];
        const currentDisplayMonth = new Date().getMonth(); // 0-indexed month for "Done in [Month]"
        
        // Refined current streak calculation
        let currentStreak = 0;
        let streakDate = new Date(); // Start from today
        for (let i = 0; i < 366; i++) { // Check up to a year back
          const dateStr = streakDate.toISOString().split('T')[0];
          if (newCompletionMap[dateStr] === true) {
            currentStreak++;
            streakDate.setDate(streakDate.getDate() - 1); // Go to previous day
          } else {
            // If the day exists in our data but wasn't completed, or if it's before the first recorded day
            // or simply missing (implies not completed), break streak.
            break;
          }
        }

        // Refined best streak calculation
        let bestStreak = 0;
        let tempStreak = 0;
        const sortedDates = Object.keys(habitsByDate).sort(); // Dates with *any* habit data
        if (sortedDates.length > 0) {
          const firstDate = new Date(sortedDates[0]);
          const lastDate = new Date(sortedDates[sortedDates.length - 1]);
          let loopDate = new Date(firstDate);

          while(loopDate <= lastDate) {
            const dateStr = loopDate.toISOString().split('T')[0];
            if (newCompletionMap[dateStr] === true) {
              tempStreak++;
            } else {
              bestStreak = Math.max(bestStreak, tempStreak);
              tempStreak = 0; // Reset streak if day is missing or incomplete
            }
            loopDate.setDate(loopDate.getDate() + 1);
          }
          bestStreak = Math.max(bestStreak, tempStreak); // Final check after loop
        }

        // Count completions in the current calendar month
        const doneInCurrentMonth = Object.keys(newCompletionMap)
          .filter(date => {
            const d = new Date(date);
            // Check if the date is within the selected year AND matches the current calendar month
            return d.getFullYear() === year && d.getMonth() === currentDisplayMonth && newCompletionMap[date];
          })
          .length;

        // Calculate overall completion rate for the year
        const totalDaysWithData = Object.keys(habitsByDate).length;
        const overallRate = totalDaysWithData > 0
          ? parseFloat(((totalCompletedDays / totalDaysWithData) * 100).toFixed(1))
          : 0;

        setHabitStats({
          currentStreak,
          bestStreak,
          doneInMonth: doneInCurrentMonth,
          overallRate,
        });

      } catch (err) {
        console.error('HabitTracker: Error fetching or processing habits:', err);
        setError(err.message || 'Failed to load habit data.');
        // Reset stats on error
        setHabitStats({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });
        setCompletionMap({});
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndProcessHabits();
  }, [year]); // Re-run when the year changes

  // --- Rendering Functions ---

  /**
   * Renders the yearly grid based on the completionMap state.
   */
  const renderYearlyGrid = () => {
    const months = Array.from({ length: 12 }, (_, i) => i); // 0-11
    const todayStr = new Date().toISOString().split('T')[0];

    return months.map((monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'long' });
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const firstDayOfMonth = monthDate.getDay(); // 0=Sun, 1=Mon, ...

      const dayCells = [];

      // Add placeholders for days before the 1st of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        dayCells.push(<div key={`pad-${monthIndex}-${i}`} className="w-4 h-4"></div>);
      }

      // Add actual day cells
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isCompleted = completionMap[dateStr] === true;
        const hasData = completionMap[dateStr] !== undefined; // Check if data exists for this day
        const isToday = dateStr === todayStr;

        let cellClass = cellColors.noData; // Default to no data
        let tooltipText = `${dateStr}: No data`;

        if (hasData) {
          if (isCompleted) {
            cellClass = cellColors.completed;
            tooltipText = `${dateStr}: Completed`;
          } else {
            cellClass = cellColors.incomplete;
            tooltipText = `${dateStr}: Incomplete`;
          }
        }

        dayCells.push(
          <div
            key={dateStr}
            data-tooltip-id="habit-day-tooltip"
            data-tooltip-content={tooltipText}
            className={`w-4 h-4 rounded-sm cursor-pointer transition-colors duration-150 hover:opacity-80 ${cellClass} ${isToday ? cellColors.todayRing : ''}`}
          />
        );
      }

      return (
        <div key={monthName} className="mb-4">
          <h5 className="text-xs text-gray-400 mb-1">{monthName}</h5>
          <div className="grid grid-cols-7 gap-1">{dayCells}</div>
        </div>
      );
    });
  };

  /**
   * Renders a statistics card.
   */
  const renderStatCard = (title, value, unit, statKey) => {
    const config = statsConfig[statKey] || { color: 'gray', icon: 'question-mark-circle' }; // Fallback config
    const IconComponent = config.icon; // Placeholder for actual icon component mapping if needed
    const colorClass = config.color; // e.g., 'blue'

    return (
      <div className={`bg-gray-800 bg-opacity-60 rounded-lg border border-${colorClass}-500/30 p-4 backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">
              {value} <span className="text-sm text-gray-300">{unit}</span>
            </p>
          </div>
          <div className={`p-2 rounded-full bg-${colorClass}-500/20 text-${colorClass}-400`}>
            {/* Replace with actual icon component based on IconComponent */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
      </div>
    );
  };


  // --- Main Render ---
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-700 rounded"></div>
          <div className="h-8 w-32 bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-700 rounded"></div>)}
        </div>
        <div className="h-8 w-full bg-gray-700 rounded"></div> {/* Legend placeholder */}
        <div className="h-64 bg-gray-700 rounded"></div> {/* Grid placeholder */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
        <p className="font-bold">Error loading habits:</p>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 bg-red-600 rounded text-white text-sm">Reload</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Year Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 md:mb-0">
          Habit Status
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setYear(year - 1)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Previous year"
          >
            <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Generate year options dynamically */}
            {[...Array(5)].map((_, i) => {
              const yearOption = new Date().getFullYear() - i;
              return <option key={yearOption} value={yearOption}>{yearOption}</option>;
            })}
          </select>
          <button
            onClick={() => setYear(year + 1)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Next year"
          >
            <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {renderStatCard('Current Streak', habitStats.currentStreak, 'Days', 'currentStreak')}
        {renderStatCard('Best Streak', habitStats.bestStreak, 'Days', 'bestStreak')}
        {renderStatCard(`Done in ${new Date().toLocaleString('default', { month: 'long' })}`, habitStats.doneInMonth, 'Days', 'doneInMonth')}
        {renderStatCard(`Yearly Rate (${year})`, habitStats.overallRate, '%', 'overallRate')}
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-3 backdrop-blur-sm text-xs">
        <div className="flex items-center">
          <div className={`w-3 h-3 ${cellColors.completed} rounded-sm mr-1.5`}></div>
          <span className="text-gray-300">Completed (≥80%)</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 ${cellColors.incomplete} rounded-sm mr-1.5`}></div>
          <span className="text-gray-300">Incomplete</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 ${cellColors.noData} rounded-sm mr-1.5`}></div>
          <span className="text-gray-300">No Data</span>
        </div>
      </div>

      {/* Yearly Grid */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
          {rawData.length === 0 && !isLoading ? (
            <div className="col-span-full text-center text-gray-400 py-10">
              No habit data found for {year}.
            </div>
          ) : (
            renderYearlyGrid()
          )}
        </div>
      </div>
      
      {/* Tooltip Component */}
      <Tooltip id="habit-day-tooltip" place="top" effect="solid" />
      
      {/* Consider adding IndividualHabitDashboard components here if needed */}
      {/* You would need to process rawData to group by habit_name */}

    </div>
  );
}
