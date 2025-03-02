// web/components/ui/ActivityFeed.js
import React from 'react';

export default function ActivityFeed({ activities = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
      <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Activity</h3>
      {(activities || []).length > 0 ? (
        <ul className="space-y-2">
          {(activities || []).map((activity, index) => (
            <li key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span>{activity.title}</span>
              <span className="text-gray-400 text-sm">{activity.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No recent activities.</p>
      )}
    </div>
  );
}
