// web/components/HabitsTab.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const HabitsTab = () => {
  const [habitData, setHabitData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('habit_analytics').select('date, consistency_score').order('date');
      setHabitData(data);
    };
    fetchData();
  }, []);

  const chartData = {
    labels: habitData.map(d => d.date),
    datasets: [{
      label: 'Consistency Score',
      data: habitData.map(d => d.consistency_score),
      borderColor: '#4bc0c0',
      fill: false,
    }],
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Habits</h2>
      <Line data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default HabitsTab;
