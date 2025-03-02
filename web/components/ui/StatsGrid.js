// web/components/ui/StatsGrid.js
import React from 'react';

export default function StatsGrid({ stats = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-700 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  console.log('Rendering StatsGrid with stats:', stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {(stats || []).map((stat, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value} <span className="text-sm">{stat.unit}</span></p>
            </div>
            <div className="text-blue-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
