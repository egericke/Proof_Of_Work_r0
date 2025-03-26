// web/components/ui/HabitTracker.js
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabaseClient';
import IndividualHabitDashboard from './IndividualHabitDashboard';
import { getDatesInRange } from '../../utils/habitStreakUtils'; // Ensure this utility is correct
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// --- Constants ---
const cellColors = {
    completed: 'bg-blue-500',
    incomplete: 'bg-gray-600',
    noData: 'bg-gray-800',
    todayRing: 'ring-2 ring-white',
};

// Dynamic titles for stats based on current month/year
const getStatsConfig = (year) => ({
    currentStreak: { title: 'Current Streak', unit: 'Days', color: 'blue', icon: 'flame' },
    bestStreak: { title: 'Best Streak', unit: 'Days', color: 'amber', icon: 'trophy' },
    doneInMonth: { title: `Done in ${new Date(year, new Date().getMonth()).toLocaleString('default', { month: 'long' })}`, unit: 'Days', color: 'green', icon: 'list-check' },
    overallRate: { title: `${year} Rate`, unit: '%', color: 'purple', icon: 'percent' }
});


const COMPLETION_THRESHOLD = 0.8; // 80% completion needed for a day to count as 'completed'

/**
 * HabitTracker component displays a yearly habit grid, stats, and allows drill-down.
 */
export default function HabitTracker({ dateRange }) {
    // --- State ---
    const [year, setYear] = useState(dateRange.endDate.getFullYear());
    const [completionMap, setCompletionMap] = useState({}); // { 'YYYY-MM-DD': boolean } -> Tracks days meeting >= 80% completion
    const [rawData, setRawData] = useState([]); // Raw fetched data { habit_date, habit_name, completed }
    const [habitsGroupedByName, setHabitsGroupedByName] = useState({}); // { 'Habit Name': { entries: [...] } }
    const [habitStats, setHabitStats] = useState({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });
    const [selectedHabitName, setSelectedHabitName] = useState(null); // For drill-down view
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statsConfig, setStatsConfig] = useState(getStatsConfig(year)); // Dynamic stats config

     // Update stats config when year changes
     useEffect(() => {
        setStatsConfig(getStatsConfig(year));
    }, [year]);

    // --- Data Fetching and Processing Effect ---
    useEffect(() => {
        async function fetchAndProcessHabits() {
            setIsLoading(true);
            setError(null);
            setCompletionMap({});
            setRawData([]);
            setHabitsGroupedByName({});
            setSelectedHabitName(null); // Reset drill-down on year change
            // Reset stats to prevent showing old data during load
            setHabitStats({ currentStreak: 0, bestStreak: 0, doneInMonth: 0, overallRate: 0 });


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
                 * to calculate daily completion status directly in the backend.
                 * 2. Indexed Queries: Ensure `habit_date` column in `habit_tracking` is indexed.
                 * 3. Incremental Loading: Fetch data month-by-month.
                 */
                const { data, error: fetchError } = await supabase
                    .from('habit_tracking')
                    .select('habit_date, habit_name, completed')
                    .gte('habit_date', startDate)
                    .lte('habit_date', endDate)
                    .order('habit_date', { ascending: true }); // Ensure data is sorted by date

                if (fetchError) throw fetchError;
                console.log(`HabitTracker: Fetched ${data?.length || 0} habit entries for ${year}.`);

                if (!data || data.length === 0) {
                    // No data found for the year, keep stats at 0
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
                    // Store only date and completion status for individual habit view
                    groupedByName[name].entries.push({ date: habit.habit_date, completed: habit.completed });
                });
                setHabitsGroupedByName(groupedByName);

                // Create completion map (day is completed if >= COMPLETION_THRESHOLD)
                const newCompletionMap = {};
                let totalOverallCompletedDays = 0; // Days meeting the threshold in the year
                Object.keys(habitsByDate).forEach(date => {
                    const dayData = habitsByDate[date];
                    const isDayCompleted = dayData.total > 0 && (dayData.completed / dayData.total) >= COMPLETION_THRESHOLD;
                    newCompletionMap[date] = isDayCompleted;
                    if (isDayCompleted) totalOverallCompletedDays++;
                });
                setCompletionMap(newCompletionMap);

                // --- Calculate Overall Stats (Using Correct Timespans) ---
                const currentDisplayMonth = new Date().getMonth(); // 0-indexed

                // Find overall first date entry in the fetched data for the year
                const overallFirstDateStr = data[0].habit_date; // Assumes data is sorted
                const overallStartDate = new Date(overallFirstDateStr);
                overallStartDate.setUTCHours(0, 0, 0, 0); // Normalize start date

                // Determine the relevant end date for the year rate calculation
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0); // Normalize today
                const yearEndDate = new Date(year, 11, 31); // Dec 31 of selected year
                yearEndDate.setUTCHours(0, 0, 0, 0); // Normalize year end date

                // Use today if the selected year is the current year AND today is within the year, otherwise use Dec 31st
                let overallRelevantEndDate = (year === today.getFullYear()) ? today : yearEndDate;

                // Ensure end date is not before the first date with data in the year
                if (overallStartDate > overallRelevantEndDate) {
                    overallRelevantEndDate = new Date(overallStartDate); // End date is the same as start date if only one day of data exists
                }

                // Calculate the number of days considered for the yearly rate
                 const datesForYearRate = getDatesInRange(overallStartDate, overallRelevantEndDate); // Use utility
                 const timespanForYearInDays = datesForYearRate.length; // Length of the array gives the count

                // Calculate Overall Rate based on the timespan since the first entry *in this year*
                const overallRate = timespanForYearInDays > 0
                    ? parseFloat(((totalOverallCompletedDays / timespanForYearInDays) * 100).toFixed(1))
                    : 0;

                // Current Streak (Counts backwards from today, using completion map)
                let currentStreak = 0;
                let streakCheckDate = new Date(); // Start from today
                while (true) {
                    const dateStr = streakCheckDate.toISOString().split('T')[0];
                     if (streakCheckDate < overallStartDate) break; // Stop if we go before data started in this year
                    if (newCompletionMap[dateStr] === true) {
                        currentStreak++;
                        streakCheckDate.setDate(streakCheckDate.getDate() - 1);
                    } else {
                        break; // Break if day is false in map OR undefined (missing)
                    }
                }

                // Best Streak (Uses completion map over the relevant timespan within the year)
                let bestStreak = 0;
                let tempStreak = 0;
                 datesForYearRate.forEach(dateStr => { // Iterate using the calculated date range
                    if (newCompletionMap[dateStr] === true) { // Check the map
                        tempStreak++;
                    } else {
                        bestStreak = Math.max(bestStreak, tempStreak);
                        tempStreak = 0; // Reset if day is missing or incomplete
                    }
                });
                bestStreak = Math.max(bestStreak, tempStreak); // Final check


                // Calculate doneInCurrentMonth based on the *calendar* month, within the selected year
                const doneInCurrentMonth = Object.keys(newCompletionMap)
                    .filter(date => {
                        const d = new Date(date);
                        // Ensure the date belongs to the selected year AND the current calendar month
                        return d.getUTCFullYear() === year && d.getUTCMonth() === currentDisplayMonth && newCompletionMap[date];
                    }).length;


                setHabitStats({
                    currentStreak,
                    bestStreak,
                    doneInMonth: doneInCurrentMonth,
                    overallRate // Use the correctly calculated rate
                });

            } catch (err) {
                console.error('HabitTracker: Error fetching/processing habits:', err);
                setError(err.message || 'Failed to load habit data.');
                // Keep stats reset
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndProcessHabits();
    }, [year]); // Re-run when the year changes


    // --- Rendering Functions ---
    const renderYearlyGrid = () => {
        const months = Array.from({ length: 12 }, (_, i) => i); // 0-11
        const todayStr = new Date().toISOString().split('T')[0];

        return months.map((monthIndex) => {
            const monthDate = new Date(year, monthIndex, 1);
            const monthName = monthDate.toLocaleString('default', { month: 'long' });
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            // Week starts Monday (0=Mon, 6=Sun)
            let firstDayOfWeek = monthDate.getDay(); // 0=Sun, 1=Mon
            if (firstDayOfWeek === 0) firstDayOfWeek = 6; // Convert Sunday from 0 to 6 (if Monday is 0)
            else firstDayOfWeek -= 1; // Shift Mon-Sat from 1-6 to 0-5

            const dayCells = [];

            // Add spacer divs for days before the 1st of the month
            for (let i = 0; i < firstDayOfWeek; i++) {
                dayCells.push(<div key={`pad-${monthIndex}-${i}`} className="w-4 h-4"></div>);
            }

            // Add actual day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isCompleted = completionMap[dateStr] === true;
                const hasData = completionMap[dateStr] !== undefined; // Check if *any* data (true or false) exists
                const isToday = dateStr === todayStr;

                let cellClass = cellColors.noData; // Default to no data recorded
                let tooltipText = `${dateStr}: No data recorded`;

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
                    <h5 className="text-xs text-gray-400 mb-1">{monthName} {year}</h5>
                    {/* Use grid-flow-row-dense potentially if alignment is tricky */}
                    <div className="grid grid-cols-7 gap-1">{dayCells}</div>
                </div>
            );
        });
    };

     const renderStatCard = (statKey) => {
        const config = statsConfig[statKey];
        const value = habitStats[statKey];
        // Placeholder Icon - replace with actual mapping if needed
        const Icon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

        return (
            <div className={`bg-gray-800 bg-opacity-60 rounded-lg border border-${config.color}-500/30 p-4 backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">{config.title}</p>
                        <p className="text-2xl font-bold text-white">
                            {value}
                            {config.unit && <span className="text-sm text-gray-300 ml-1">{config.unit}</span>}
                        </p>
                    </div>
                    <div className={`p-2 rounded-full bg-${config.color}-500/20 text-${config.color}-400`}>
                         <Icon />
                    </div>
                </div>
            </div>
        );
     };

    const handleHabitSelect = (habitName) => {
        setSelectedHabitName(habitName);
    };

    // --- Main Render ---
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                {/* ... Loading Skeleton ... */}
                 <div className="flex justify-between items-center"><div className="h-8 w-48 bg-gray-700 rounded"></div><div className="h-8 w-32 bg-gray-700 rounded"></div></div>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-700 rounded"></div>)}</div>
                 <div className="h-8 w-full bg-gray-700 rounded"></div>
                 <div className="h-64 bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
                {/* ... Error Display ... */}
                 <p className="font-bold">Error loading habits:</p>
                 <p className="mb-2">{error}</p>
                 <button onClick={() => window.location.reload()} className="px-3 py-1 bg-red-600 rounded text-white text-sm hover:bg-red-700">Reload Page</button>
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
                {renderStatCard('currentStreak')}
                {renderStatCard('bestStreak')}
                {renderStatCard('doneInMonth')}
                {renderStatCard('overallRate')}
             </div>

            {/* Color Legend */}
             <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-3 backdrop-blur-sm text-xs">
                 <div className="flex items-center"><div className={`w-3 h-3 ${cellColors.completed} rounded-sm mr-1.5`}></div><span className="text-gray-300">Completed (≥{COMPLETION_THRESHOLD * 100}%)</span></div>
                 <div className="flex items-center"><div className={`w-3 h-3 ${cellColors.incomplete} rounded-sm mr-1.5`}></div><span className="text-gray-300">Incomplete</span></div>
                 <div className="flex items-center"><div className={`w-3 h-3 ${cellColors.noData} rounded-sm mr-1.5`}></div><span className="text-gray-300">No Data</span></div>
             </div>

            {/* Yearly Grid */}
            <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
              {/* Adjust column count based on screen size if needed */}
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
              {Object.keys(habitsGroupedByName).length === 0 && !isLoading ? (
                <p className="text-gray-400 text-center py-4">No individual habits tracked for {year}.</p>
              ) : selectedHabitName ? (
                // Show Individual Habit Dashboard
                <div>
                  <button
                    onClick={() => setSelectedHabitName(null)}
                    className="mb-4 text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to All Habits
                  </button>
                  <IndividualHabitDashboard
                    key={selectedHabitName}
                    habitName={selectedHabitName}
                    habitData={habitsGroupedByName[selectedHabitName]}
                  />
                </div>
              ) : (
                // Show list of habits
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.keys(habitsGroupedByName).sort().map(habitName => (
                    <button
                      key={habitName}
                      onClick={() => handleHabitSelect(habitName)}
                      className="bg-gray-700 p-3 rounded-lg text-left hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span className="font-medium text-white">{habitName}</span>
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
