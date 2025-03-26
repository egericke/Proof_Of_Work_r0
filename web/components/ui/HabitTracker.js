// web/components/ui/HabitTracker.js
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabaseClient';
import IndividualHabitDashboard from './IndividualHabitDashboard'; // Import the component
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// --- Constants ---
const cellColors = {
  completed: 'bg-blue-500',
  incomplete: 'bg-gray-600',
  noData: 'bg-gray-800',
  todayRing: 'ring-2 ring-white',
};

const statsConfig = {
  currentStreak: { title: 'Current Streak', unit: 'Days', color: 'blue', icon: 'flame' },
  bestStreak: { title: 'Best Streak', unit: 'Days', color: 'amber', icon: 'trophy' },
  doneInMonth: { title: `Done in ${new Date().toLocaleString('default', { month: 'long' })}`, unit: 'Days', color: 'green', icon: 'list-check' },
  overallRate: { title: 'Yearly Rate', unit: '%', color: 'purple', icon: 'percent' }
};

const COMPLETION_THRESHOLD = 0.8; // 80% completion needed for a day to count as 'completed'

/**
 * HabitTracker component displays a yearly habit grid, stats, and allows drill-down.
 */
export default function HabitTracker({ dateRange }) {
  // --- State ---
  const [year, setYear] = useState(dateRange.endDate.getFullYear());
  const [completionMap, setCompletionMap] = useState({}); // { 'YYYY-MM-DD': boolean }
  const [rawData, setRawData] = useState([]); // Raw fetched data { habit_date, habit_name, completed }
  const [habitsGroupedByName, setHabitsGroupedByName] = useState({}); // { 'Habit Name': { entries: [...], stats: {...} } }
  const [habitStats, setHabitStats] = useState({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });
  const [selectedHabitName, setSelectedHabitName] = useState(null); // For drill-down view
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching and Processing Effect ---
  useEffect(() => {
    async function fetchAndProcessHabits() {
      setIsLoading(true);
      setError(null);
      setCompletionMap({});
      setRawData([]);
      setHabitsGroupedByName({});
      setSelectedHabitName(null); // Reset drill-down on year change

      try {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase client not available');

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        console.log(`HabitTracker: Fetching habits for ${year} (${startDate} to ${endDate})`);

        /*
         * Performance Note: Fetching all habit entries for a whole year might be slow
         * for users with many habits tracked over a long time.
         * Potential Optimizations:
         * 1. Server-Side Aggregation: Use a Supabase Function or Database View
         *    to calculate daily completion status (the >= 80% rule) directly in the backend.
         *    This would reduce the amount of raw data transferred to the client.
         * 2. Indexed Queries: Ensure `habit_date` column in `habit_tracking` is indexed.
         * 3. Incremental Loading (More Complex): Fetch data month-by-month as the user scrolls
         *    or navigates through the year view.
         */
        const { data, error: fetchError } = await supabase
          .from('habit_tracking')
          .select('habit_date, habit_name, completed') // Fetch name for grouping
          .gte('habit_date', startDate)
          .lte('habit_date', endDate)
          .order('habit_date', { ascending: true });

        if (fetchError) throw fetchError;
        console.log(`HabitTracker: Fetched ${data?.length || 0} habit entries.`);

        if (!data || data.length === 0) {
          setHabitStats({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });
          setIsLoading(false);
          return;
        }

        setRawData(data);

        // --- Process Data ---
        const habitsByDate = {}; // { 'YYYY-MM-DD': { total: N, completed: M } }
        const groupedByName = {}; // { 'Habit Name': { entries: [...] } }

        data.forEach(habit => {
          const date = habit.habit_date;
          const name = habit.habit_name || 'Unnamed Habit';

          // Group by Date for overall stats
          if (!habitsByDate[date]) habitsByDate[date] = { total: 0, completed: 0 };
          habitsByDate[date].total++;
          if (habit.completed) habitsByDate[date].completed++;

          // Group by Name for drill-down
          if (!groupedByName[name]) groupedByName[name] = { entries: [] };
          groupedByName[name].entries.push({ date: habit.habit_date, completed: habit.completed });
        });
        setHabitsGroupedByName(groupedByName);

        // Create completion map (day is completed if >= COMPLETION_THRESHOLD)
        const newCompletionMap = {};
        let totalCompletedDays = 0;
        Object.keys(habitsByDate).forEach(date => {
          const dayData = habitsByDate[date];
          const isDayCompleted = dayData.total > 0 && (dayData.completed / dayData.total) >= COMPLETION_THRESHOLD;
          newCompletionMap[date] = isDayCompleted;
          if (isDayCompleted) totalCompletedDays++;
        });
        setCompletionMap(newCompletionMap);

        // --- Calculate Overall Stats ---
        const currentDisplayMonth = new Date().getMonth(); // For "Done in [Month]"

        // Calculate current streak (using the completion map)
        let currentStreak = 0;
        let streakDate = new Date();
        while (true) {
          const dateStr = streakDate.toISOString().split('T')[0];
          if (newCompletionMap[dateStr] === true) { // Check our processed map
            currentStreak++;
            streakDate.setDate(streakDate.getDate() - 1);
          } else {
            break; // Streak broken if day is false or undefined in map
          }
        }

        // Calculate best streak (using the completion map and full year range)
        let bestStreak = 0;
        let tempStreak = 0;
        let loopDate = new Date(year, 0, 1); // Start from Jan 1st of the year
        const yearEndDate = new Date(year, 11, 31); // Dec 31st of the year
        while(loopDate <= yearEndDate) {
          const dateStr = loopDate.toISOString().split('T')[0];
          if (newCompletionMap[dateStr] === true) {
            tempStreak++;
          } else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 0; // Reset streak if day is missing or incomplete
          }
          loopDate.setDate(loopDate.getDate() + 1);
        }
        bestStreak = Math.max(bestStreak, tempStreak); // Final check

        const doneInCurrentMonth = Object.keys(newCompletionMap)
          .filter(date => {
            const d = new Date(date);
            return d.getFullYear() === year && d.getMonth() === currentDisplayMonth && newCompletionMap[date];
          }).length;

        const totalDaysWithData = Object.keys(habitsByDate).length;
        const overallRate = totalDaysWithData > 0
          ? parseFloat(((totalCompletedDays / totalDaysWithData) * 100).toFixed(1))
          : 0;

        setHabitStats({ currentStreak, bestStreak, doneInMonth: doneInCurrentMonth, overallRate });

      } catch (err) {
        console.error('HabitTracker: Error fetching/processing habits:', err);
        setError(err.message || 'Failed to load habit data.');
        setHabitStats({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });
        setCompletionMap({});
        setHabitsGroupedByName({});
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndProcessHabits();
  }, [year]); // Re-run when the year changes

  // --- Rendering Functions ---
  const renderYearlyGrid = () => {
        // ... (This function remains identical to the previous version) ...
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
                 const hasData = completionMap[dateStr] !== undefined;
                 const isToday = dateStr === todayStr;

                 let cellClass = cellColors.noData;
                 let tooltipText = `${dateStr}: No data`;

                 if (hasData) {
                     if (isCompleted) {
                         cellClass = cellColors.completed;
                         tooltipText = `${dateStr}: Completed (≥${COMPLETION_THRESHOLD * 100}%)`;
                     } else {
                         cellClass = cellColors.incomplete;
                         tooltipText = `${dateStr}: Incomplete (<${COMPLETION_THRESHOLD * 100}%)`;
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

  const renderStatCard = (title, value, unit, statKey) => {
        // ... (This function remains identical to the previous version) ...
        const config = statsConfig[statKey] || { title: 'Stat', unit: '', color: 'gray', icon: 'question-mark-circle' };
        const IconComponent = config.icon; // Placeholder
        const colorClass = config.color;

        return (
            <div className={`bg-gray-800 bg-opacity-60 rounded-lg border border-${colorClass}-500/30 p-4 backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">{config.title || title}</p>
                        <p className="text-2xl font-bold text-white">
                            {value} <span className="text-sm text-gray-300">{config.unit || unit}</span>
                        </p>
                    </div>
                    <div className={`p-2 rounded-full bg-${colorClass}-500/20 text-${colorClass}-400`}>
                        {/* Placeholder Icon */}
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                </div>
            </div>
        );
  };

  const handleHabitSelect = (habitName) => {
    setSelectedHabitName(habitName);
  };

  // --- Main Render ---
  // (Loading and Error states remain the same as previous version)
   if (isLoading) {
     return ( /* ... Loading Skeleton ... */ );
   }

   if (error) {
     return ( /* ... Error Display ... */ );
   }

  return (
    <div className="space-y-6">
      {/* Header and Year Selector */}
      {/* ... (Same as previous version) ... */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
           <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 md:mb-0">
             Habit Status
           </h2>
           <div className="flex items-center space-x-2">
               {/* Year controls */}
               <button onClick={() => setYear(y => y - 1)} aria-label="Previous year" className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                 <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
               </button>
               <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-3 py-1 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
               </select>
               <button onClick={() => setYear(y => y + 1)} aria-label="Next year" className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                   <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
           </div>
       </div>

      {/* Overall Stats Cards */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {renderStatCard(null, habitStats.currentStreak, null, 'currentStreak')}
          {renderStatCard(null, habitStats.bestStreak, null, 'bestStreak')}
          {renderStatCard(null, habitStats.doneInMonth, null, 'doneInMonth')}
          {renderStatCard(`${year} Rate`, habitStats.overallRate, null, 'overallRate')}
       </div>

      {/* Color Legend */}
       <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-3 backdrop-blur-sm text-xs">
          {/* ... (Legend items - same as previous version) ... */}
           <div className="flex items-center"><div className={`w-3 h-3 ${cellColors.completed} rounded-sm mr-1.5`}></div><span className="text-gray-300">Completed (≥{COMPLETION_THRESHOLD * 100}%)</span></div>
           <div className="flex items-center"><div className={`w-3 h-3 ${cellColors.incomplete} rounded-sm mr-1.5`}></div><span className="text-gray-300">Incomplete</span></div>
           <div className="flex items-center"><div className={`w-3 h-3 ${cellColors.noData} rounded-sm mr-1.5`}></div><span className="text-gray-300">No Data</span></div>
       </div>

      {/* Yearly Grid */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
          {rawData.length === 0 && !isLoading ? (
            <div className="col-span-full text-center text-gray-400 py-10">No habit data found for {year}.</div>
          ) : (
            renderYearlyGrid()
          )}
        </div>
      </div>

      {/* --- Individual Habit Section --- */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Habit Drilldown</h3>
        {Object.keys(habitsGroupedByName).length === 0 ? (
          <p className="text-gray-400 text-center py-4">No individual habits tracked for {year}.</p>
        ) : selectedHabitName ? (
          // Show Individual Habit Dashboard if a habit is selected
          <div>
            <button
              onClick={() => setSelectedHabitName(null)}
              className="mb-4 text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to All Habits
            </button>
            <IndividualHabitDashboard
              key={selectedHabitName} // Force re-render on change
              habitName={selectedHabitName}
              habitData={habitsGroupedByName[selectedHabitName]}
            />
          </div>
        ) : (
          // Show list of habits to select
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.keys(habitsGroupedByName).sort().map(habitName => (
              <button
                key={habitName}
                onClick={() => handleHabitSelect(habitName)}
                className="bg-gray-700 p-3 rounded-lg text-left hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="font-medium text-white">{habitName}</span>
                {/* Optional: Add a small stat like completion rate here */}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tooltip Component */}
      <Tooltip id="habit-day-tooltip" place="top" effect="solid" />
    </div>
  );
}
