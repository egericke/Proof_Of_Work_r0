// web/pages/toggl.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

export default function TogglPage() {
  const [chartData, setChartData] = useState({ datasets: [] });

  useEffect(() => {
    async function fetchToggl() {
      const res = await fetch('/api/toggl');
      const data = await res.json();

      // data is an array of { week_start, bucket, total_minutes }
      const weeksMap = {};
      data.forEach((row) => {
        const w = row.week_start;
        if (!weeksMap[w]) weeksMap[w] = {};
        weeksMap[w][row.bucket] = row.total_minutes;
      });

      const allBuckets = new Set();
      data.forEach((row) => allBuckets.add(row.bucket));
      const bucketsArray = Array.from(allBuckets);

      const labels = Object.keys(weeksMap).sort();
      const datasets = bucketsArray.map((b) => ({
        label: b,
        data: labels.map((l) => weeksMap[l][b] || 0),
      }));

      setChartData({ labels, datasets });
    }
    fetchToggl();
  }, []);

  const options = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return (
    <div>
      <h1>Toggl Weekly Buckets</h1>
      <Bar data={chartData} options={options} />
    </div>
  );
}
