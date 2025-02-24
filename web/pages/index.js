// web/pages/index.js
import { useState } from 'react';
import OverviewTab from '../components/OverviewTab';
import FitnessTab from '../components/FitnessTab';
import TimeManagementTab from '../components/TimeManagementTab';
import HabitsTab from '../components/HabitsTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'fitness':
        return <FitnessTab />;
      case 'timeManagement':
        return <TimeManagementTab />;
      case 'habits':
        return <HabitsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-700'}`}>Overview</button>
              <button onClick={() => setActiveTab('fitness')} className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'fitness' ? 'bg-gray-900 text-white' : 'text-gray-700'}`}>Fitness</button>
              <button onClick={() => setActiveTab('timeManagement')} className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'timeManagement' ? 'bg-gray-900 text-white' : 'text-gray-700'}`}>Time Management</button>
              <button onClick={() => setActiveTab('habits')} className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'habits' ? 'bg-gray-900 text-white' : 'text-gray-700'}`}>Habits</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderTab()}
      </main>
    </div>
  );
};

export default Dashboard;
