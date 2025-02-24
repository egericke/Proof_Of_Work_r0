// web/components/TimeManagementTab.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const TimeManagementTab = () => {
  const [togglData, setTogglData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('toggl_time').select('date, bucket, hours').order('date');
      setTogglData(data);
    };
    fetchData();
  }, []);

  const chartData = {
    labels: [...new Set(togglData.map(d => d.date))],
    datasets: [...new Set(togglData.map(d => d.bucket))].map(bucket => ({
      label: bucket,
      data: togglData.filter(d => d.bucket === bucket).map(d => d.hours),
      backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    })),
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Time Management</h2>
      <Bar data={chartData} options={{ responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }} />
    </div>
  );
};

export default TimeManagementTab;
