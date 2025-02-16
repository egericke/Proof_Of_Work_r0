// web/pages/index.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function Home() {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [vo2max, setVo2max] = useState(null);

  useEffect(() => {
    async function fetchWorkouts() {
      const resW = await fetch('/api/workouts');
      const workouts = await resW.json();

      const labels = workouts.map((w) => w.workout_date);
      const metHours = workouts.map((w) => w.met_hours || 0);

      setChartData({
        labels,
        datasets: [
          {
            label: 'MET Hours',
            data: metHours,
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
          },
        ],
      });

      const resV = await fetch('/api/vo2max');
      const vo2Data = await resV.json();
      if (vo2Data.vo2max) {
        setVo2max(vo2Data.vo2max);
      }
    }
    fetchWorkouts();
  }, []);

  return (
    <div>
      <h1>My Garmin/Strava Workouts</h1>
      <div style={{ width: '700px' }}>
        <Line data={chartData} />
      </div>
      {vo2max && <p>Latest VO₂ max: {vo2max.toFixed(1)}</p>}
    </div>
  );
}
