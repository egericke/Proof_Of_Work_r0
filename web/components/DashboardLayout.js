// web/components/DashboardLayout.js
import { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingOverlay from './LoadingOverlay';
import DebugPanel from './DebugPanel';
import { getSupabaseClient } from '../utils/supabaseClient';
import OverviewPanel from './panels/OverviewPanel';
import FitnessPanel from './panels/FitnessPanel';
import TimePanel from './panels/TimePanel';
import HabitsPanel from './panels/HabitsPanel';
import ErrorBoundary from './ErrorBoundary';

export default function DashboardLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [userData, setUserData] = useState({ name: 'Dashboard User', avatar: '/avatar-placeholder.png' });
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  // Initialize Supabase client - ensure we don't fetch data until initialization is complete
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Supabase client
        const supabaseClient = getSupabaseClient();
        setSupabase(supabaseClient);
        
        // Check supabase connection
        if (!supabaseClient) {
          console.warn('Supabase client could not be initialized. Using fallback data.');
        } else {
          console.log('Supabase client initialized successfully.');
          
          // Test a simple query to verify connection
          try {
            const { data, error } = await supabaseClient.from('workout_stats').select('count');
            if (error) {
              console.warn('Supabase connection test failed:', error.message);
            } else {
              console.log('Supabase connection test successful');
            }
          } catch (queryError) {
            console.warn('Supabase query test failed:', queryError);
          }
        }
        
        // Mark Supabase as fully initialized
        setSupabaseInitialized(true);
        
        // Simulate loading for better UX
        setTimeout(() => setIsLoading(false), 1000);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoadError(error ? error.message : 'Unknown error initializing app');
        setSupabaseInitialized(true); // Mark as initialized even on error so components fall back to mock data
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    initApp();
  }, []); // No dependencies - we only want to run this once

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
    
    // Don't render panels until Supabase is initialized
    if (!supabaseInitialized) {
      return <LoadingOverlay message="Initializing data connection..." />;
    }

    // Initialize empty panel props to avoid undefined errors
    const panelProps = {
      dateRange: dateRange || {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
      supabase
    };
    
    switch (activePanel) {
      case 'overview':
        return (
          <ErrorBoundary componentName="OverviewPanel">
            <OverviewPanel {...panelProps} />
          </ErrorBoundary>
        );
      case 'fitness':
        return (
          <ErrorBoundary componentName="FitnessPanel">
            <FitnessPanel {...panelProps} />
          </ErrorBoundary>
        );
      case 'time':
        return (
          <ErrorBoundary componentName="TimePanel">
            <TimePanel {...panelProps} />
          </ErrorBoundary>
        );
      case 'habits':
        return (
          <ErrorBoundary componentName="HabitsPanel">
            <HabitsPanel {...panelProps} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary componentName="OverviewPanel">
            <OverviewPanel {...panelProps} />
          </ErrorBoundary>
        );
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <DashboardHeader
        userData={userData}
        dateRange={dateRange}
        setDateRange={setDateRange}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex flex-1 overflow-hidden">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{renderActivePanel()}</main>
      </div>
      <DebugPanel supabase={supabase} />
    </div>
  );
}
