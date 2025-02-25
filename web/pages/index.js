// web/pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import OverviewPanel from '../components/panels/OverviewPanel';
import FitnessPanel from '../components/panels/FitnessPanel';
import TimePanel from '../components/panels/TimePanel';
import HabitsPanel from '../components/panels/HabitsPanel';
import LoadingOverlay from '../components/LoadingOverlay';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState('overview');
  const [userData, setUserData] = useState({
    name: 'Dashboard User',
    avatar: '/avatar-placeholder.png'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });
  
  // Simulated data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <OverviewPanel supabase={supabase} dateRange={dateRange} />;
      case 'fitness':
        return <FitnessPanel supabase={supabase} dateRange={dateRange} />;
      case 'time':
        return <TimePanel supabase={supabase} dateRange={dateRange} />;
      case 'habits':
        return <HabitsPanel supabase={supabase} dateRange={dateRange} />;
      default:
        return <OverviewPanel supabase={supabase} dateRange={dateRange} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Head>
        <title>My Daily Proof | Personal Dashboard</title>
        <meta name="description" content="Personal fitness, time management, and habits tracking dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {isLoading && <LoadingOverlay />}

      <DashboardHeader 
        userData={userData} 
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar 
          activePanel={activePanel} 
          setActivePanel={setActivePanel} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 bg-gray-800 bg-opacity-30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
