// web/components/FitnessTab.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const FitnessTab = () => {
  const [vo2MaxData, setVO2MaxData] = useState([]);
  const [activityTypes, setActivityTypes] = useState({});
  const [distance, setDistance] = useState('');

  // Fetch fitness data
  useEffect(() => {
    const fetchData = async () => {
      const { data: vo2Max } = await supabase.from('vo2max_tests').select('test_date, vo2max_value').order('test_date');
      const { data: activities } = await supabase.from('workout_stats').select('activity_type');

      const activityCounts = activities.reduce((acc, curr) => {
        acc[curr.activity_type] = (acc[curr.activity_type] || 0) + 1;
        return acc;
      }, {});

      setVO2MaxData(vo2Max);
      setActivityTypes(activityCounts);
    };
    fetchData();
  }, []);

  // Calculate VO2 max from Cooper test distance and save to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distance || isNaN(distance)) {
      alert('Please enter a valid distance in meters');
      return;
    }

    // VO2 max formula for Cooper test: (distance in meters - 504.9) / 44.73
    const vo2Max = ((parseFloat(distance) - 504.9) / 44.73).toFixed(2);
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('vo2max_tests').insert([{ test_date: today, vo2max_value: vo2Max }]);
    if (error) {
      console.error('Error saving VO2 max:', error);
      alert('Failed to save VO2 max');
    } else {
      setVO2MaxData([...vo2MaxData, { test_date: today, vo2max_value: vo2Max }]);
      setDistance('');
      alert(`VO2 Max calculated: ${vo2Max}`);
    }
  };

  const vo2ChartData = {
    labels: vo2MaxData.map(d => d.test_date),
    datasets: [{
      label: 'VO2 Max',
      data: vo2MaxData.map(d => d.vo2max_value),
      borderColor: '#4bc0c0',
      fill: false,
    }],
  };

  const activityChartData = {
    labels: Object.keys(activityTypes),
    datasets: [{
      data: Object.values(activityTypes),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Fitness</h2>

      {/* Cooper Test Form */}
      <div className="mb-8 bg-white p-4 rounded shadow">
        <h3 className="text-xl mb-2">Enter Cooper Test Distance</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Distance in meters"
            className="border p-2 rounded"
            min="0"
            step="0.1"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Calculate & Save VO2 Max
          </button>
        </form>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <h3 className="text-xl mb-2">VO2 Max Trend</h3>
        <Line data={vo2ChartData} options={{ responsive: true }} />
      </div>
      <div>
        <h3 className="text-xl mb-2">Activity Distribution</h3>
        <Pie data={activityChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default FitnessTab;
