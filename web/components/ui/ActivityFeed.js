// web/components/ui/ActivityFeed.js
import React from 'react';

export default function ActivityFeed({ activities = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
      <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Activity</h3>
      {activities?.length > 0 ? (
        <ul className="space-y-4">
          {activities?.map((activity, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-blue-400">•</span>
              <div>
                <p className="text-gray-200">{activity.title}</p>
                <p className="text-sm text-gray-400">
                  {activity.type} • {activity.date} • {activity.value}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No recent activities to display.</p>
      )}
    </div>
  );
}
