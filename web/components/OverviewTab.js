// web/components/OverviewTab.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const OverviewTab = () => {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const fetchSummary = async () => {
      const { data: vo2Max } = await supabase.from('vo2max_tests').select('vo2max_value').order('test_date', { ascending: false }).limit(1);
      const { data: activities } = await supabase.from('workout_stats').select('id').gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      const { data: toggl } = await supabase.from('toggl_time').select('bucket, hours').gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      const { data: habits } = await supabase.from('habit_analytics').select('consistency_score').gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setSummary({
        vo2Max: vo2Max[0]?.vo2max_value || 'N/A',
        activitiesThisWeek: activities.length,
        togglHours: toggl.reduce((acc, curr) => acc + curr.hours, 0),
        habitCompletion: habits.length > 0 ? (habits.reduce((acc, curr) => acc + curr.consistency_score, 0) / habits.length).toFixed(2) : 'N/A'
      });
    };
    fetchSummary();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Fitness</h3>
          <p>VO2 Max: {summary.vo2Max}</p>
          <p>Activities This Week: {summary.activitiesThisWeek}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Time Management</h3>
          <p>Total Hours This Week: {summary.togglHours}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Habits</h3>
          <p>Average Completion Rate: {summary.habitCompletion}%</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
