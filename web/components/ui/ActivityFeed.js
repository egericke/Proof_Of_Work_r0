// web/components/ui/ActivityFeed.js
import React from 'react';

export default function ActivityFeed({ activities = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-16 bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  console.log('Rendering ActivityFeed with activities:', activities);

  if (!activities || !activities.length) {
    return <div className="text-gray-400 text-center py-4">No recent activities</div>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-blue-300 font-medium">{activity?.title || 'Activity'}</h4>
              <p className="text-gray-400 text-sm">{activity?.date || 'No date'}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{activity?.value || '-'}</p>
              <p className="text-gray-400 text-sm">{activity?.type || 'Unknown'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
