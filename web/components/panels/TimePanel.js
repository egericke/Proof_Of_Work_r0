// web/components/panels/TimePanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import { getSupabaseClient } from '../../utils/supabaseClient';

export default function TimePanel({ dateRange }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();

        if (!supabase) throw new Error('Supabase client not available');

        const { data: togglData, error } = await supabase
          .from('toggl_entries')
          .select('date, bucket, hours')
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true });

        if (error) throw error;

        if (togglData?.length) {
          const dateGroups = {};
          const allBuckets = new Set();

          togglData.forEach((entry) => {
            const dateStr = entry.date;
            if (!dateGroups[dateStr]) dateGroups[dateStr] = {};
            const bucket = entry.bucket || 'Uncategorized';
            allBuckets.add(bucket);
            dateGroups[dateStr][bucket] = (dateGroups[dateStr][bucket] || 0) + (entry.hours || 0);
          });

          const dates = Object.keys(dateGroups).sort();
          const buckets = Array.from(allBuckets);
          const colors = [
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ];

          const datasets = buckets.map((bucket, index) => ({
            label: bucket,
            data: dates.map((date) => dateGroups[date][bucket] || 0),
            backgroundColor: colors[index % colors.length],
          }));

          setChartData({ labels: dates, datasets });
        } else {
          setError('No time tracking data found');
        }
      } catch (err) {
        console.error('Error fetching time data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
        <p className="font-bold">Error loading Time Panel:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Time Tracking
      </h2>
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Time Distribution</h3>
        <DataChart
          data={chartData}
          type="bar"
          height={300}
          isLoading={isLoading || !chartData.labels.length}
          options={{
            scales: {
              x: { stacked: true },
              y: { stacked: true, title: { display: true, text: 'Hours' } },
            },
          }}
        />
      </div>
    </div>
  );
}
