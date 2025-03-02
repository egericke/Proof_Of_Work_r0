// web/components/DashboardLayout.js - With enhanced error handling
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingOverlay from './LoadingOverlay';
import DebugPanel from './DebugPanel';
import ComponentErrorBoundary from './ComponentErrorBoundary';

// Panels - Using direct imports for now to ensure they load
import OverviewPanel from './panels/OverviewPanel';
import FitnessPanel from './panels/FitnessPanel';
import TimePanel from './panels/TimePanel';
import HabitsPanel from './panels/HabitsPanel';

// Create a singleton Supabase client for use throughout the app
let supabaseInstance = null;

const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  // Only initialize on client-side
  if (typeof window === 'undefined') return null;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found. Check your environment variables.');
    return null;
  }
  
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export default function DashboardLayout() {
  // Add client-side rendering guard
  const [isMounted, setIsMounted] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date() // Today
  });
  const [userData, setUserData] = useState({
    name: 'Dashboard User',
    avatar: '/avatar-placeholder.png'
  });

  // Force client-side render
  useEffect(() => {
    setIsMounted(true);
    console.log("DashboardLayout mounted");
  }, []);

  // Initialize Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Use our singleton function to get the client
        const supabaseClient = getSupabaseClient();
        
        if (!supabaseClient) {
          throw new Error('Failed to initialize Supabase client');
        }
        
        setSupabase(supabaseClient);
        console.log("Supabase client initialized successfully");
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        setLoadError(error.message);
      } finally {
        // Always set loading to false even if there was an error
        setIsLoading(false);
      }
    };
    
    if (isMounted) {
      initSupabase();
    }
  }, [isMounted]);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to render panels with error boundaries
  const renderPanelWithErrorBoundary = (PanelComponent, componentName) => {
    return (
      <ComponentErrorBoundary 
        componentName={componentName}
        fallback={
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300">Unable to load this component. Try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
        }
      >
        <PanelComponent supabase={supabase} dateRange={dateRange} />
      </ComponentErrorBoundary>
    );
  };

  // Render active panel based on selection
  const renderActivePanel = () => {
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-xl text-red-400 mb-4">Error loading dashboard</div>
          <p className="text-gray-400 max-w-md text-center mb-4">
            {loadError}
          </p>
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
        return renderPanelWithErrorBoundary(OverviewPanel, "Overview Panel");
      case 'fitness':
        return renderPanelWithErrorBoundary(FitnessPanel, "Fitness Panel");
      case 'time':
        return renderPanelWithErrorBoundary(TimePanel, "Time Panel");
      case 'habits':
        return renderPanelWithErrorBoundary(HabitsPanel, "Habits Panel");
      default:
        return renderPanelWithErrorBoundary(OverviewPanel, "Overview Panel");
    }
  };

  // Client-side rendering guard
  if (!isMounted) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <ComponentErrorBoundary componentName="Dashboard Header">
        <DashboardHeader 
          userData={userData} 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          toggleSidebar={toggleSidebar}
        />
      </ComponentErrorBoundary>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <ComponentErrorBoundary componentName="Dashboard Sidebar">
          <DashboardSidebar 
            activePanel={activePanel} 
            setActivePanel={setActivePanel}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
        </ComponentErrorBoundary>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-16 w-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : renderActivePanel()}
        </main>
      </div>
      
      <ComponentErrorBoundary componentName="Debug Panel">
        <DebugPanel supabase={supabase} />
      </ComponentErrorBoundary>
    </div>
  );
}
