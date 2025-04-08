// web/components/panels/HabitsPanel.js
import React from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import ErrorBoundary from '../ErrorBoundary'; // Assuming ErrorBoundary component exists
import HabitTracker from '../ui/HabitTracker'; // Assuming HabitTracker component exists

export default function HabitsPanel({ dateRange }) {
  return (
    // Add the id here for Puppeteer targeting
    <div className="space-y-6" id="habits-panel-container">
      <ErrorBoundary componentName="HabitTracker">
        {/* Ensure HabitTracker receives any necessary props like dateRange */}
        <HabitTracker dateRange={dateRange} />
      </ErrorBoundary>
      {/* Tooltip component for potential use within HabitTracker */}
      <Tooltip id="habit-tooltip" />
    </div>
  );
}
