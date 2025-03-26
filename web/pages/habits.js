// web/pages/habits.js
import React, { useState } from 'react';
import HabitsPanel from '../components/panels/HabitsPanel';
import DashboardHeader from '../components/DashboardHeader'; // Optional: for consistent header
import ErrorBoundary from '../components/ErrorBoundary';

// Basic user data placeholder for the header if used
const placeholderUserData = {
  name: 'Habit Viewer',
  avatar: '/avatar-placeholder.png',
};

export default function HabitsPage() {
  // Manage date range state locally for this standalone page
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    endDate: new Date(), // Today
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Optional: Add a simplified header or the full DashboardHeader */}
      <DashboardHeader
        userData={placeholderUserData}
        dateRange={dateRange}
        setDateRange={setDateRange}
        toggleSidebar={() => {}} // No sidebar on standalone page
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <ErrorBoundary componentName="HabitsPanel (Standalone Page)">
          {/* HabitsPanel now correctly receives dateRange */}
          <HabitsPanel dateRange={dateRange} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
