// web/components/panels/HabitsPanel.js
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import HabitTracker from '../ui/HabitTracker';

export default function HabitsPanel({ dateRange }) {
  return (
    <div className="space-y-6">
      <ErrorBoundary componentName="HabitTracker">
        <HabitTracker />
      </ErrorBoundary>
    </div>
  );
}
