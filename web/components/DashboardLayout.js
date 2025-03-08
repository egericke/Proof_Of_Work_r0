// web/components/DashboardLayout.js
import { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingOverlay from './LoadingOverlay';
import DebugPanel from './DebugPanel';
import { getSupabaseClient } from '../utils/supabaseClient';

// Panel components
import OverviewPanel from './panels/OverviewPanel';
import FitnessPanel from './panels/FitnessPanel';
import TimePanel from './panels/TimePanel';
import HabitsPanel from './panels/HabitsPanel';

export default function DashboardLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(), // Today
  });
  const [userData, setUserData] = useState({
    name: 'Dashboard User',
    avatar: '/avatar-placeholder.png',
  });

  // Initialize app and Supabase check
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseClient();

        if (!supabase) {
          throw new Error('Supabase client could not be initialized. Using fallback data.');
        }

        // Simulate loading for better UX and ensure initial setup
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render active panel based on selection
  const renderActivePanel = () => {
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-xl text-red-400 mb-4">Error loading dashboard</div>
          <p className="text-gray-400 max-w-md text-center mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activePanel) {
      case 'overview':
        return <OverviewPanel dateRange={dateRange} />;
      case 'fitness':
        return <FitnessPanel dateRange={dateRange} />;
      case 'time':
        return <TimePanel dateRange={dateRange} />;
      case 'habits':
        return <HabitsPanel dateRange={dateRange} />;
      default:
        return <OverviewPanel dateRange={dateRange} />;
    }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <DashboardHeader
        userData={userData}
        dateRange={dateRange}
        setDateRange={setDateRange}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <DashboardSidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderActivePanel()}
        </main>
      </div>

      <DebugPanel />
    </div>
  );
}
