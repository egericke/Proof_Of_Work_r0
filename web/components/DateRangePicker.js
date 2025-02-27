// web/components/DateRangePicker.js
import { useState, useEffect } from 'react';

// Custom date presets
const datePresets = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Year to Date', custom: true }
];

export default function DateRangePicker({ dateRange, setDateRange, onClose }) {
  const [localStartDate, setLocalStartDate] = useState(
    dateRange.startDate.toISOString().split('T')[0]
  );
  const [localEndDate, setLocalEndDate] = useState(
    dateRange.endDate.toISOString().split('T')[0]
  );
  const [activePreset, setActivePreset] = useState(null);

  // Validate end date is not before start date
  useEffect(() => {
    if (new Date(localEndDate) < new Date(localStartDate)) {
      setLocalEndDate(localStartDate);
    }
  }, [localStartDate, localEndDate]);

  const handleApply = () => {
    setDateRange({
      startDate: new Date(localStartDate),
      endDate: new Date(localEndDate)
    });
    onClose();
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.label);
    
    const end = new Date();
    end.setHours(23, 59, 59, 999); // Set to end of day
    
    let start;
    
    if (preset.custom && preset.label === 'Year to Date') {
      start = new Date(end.getFullYear(), 0, 1); // January 1st of current year
    } else {
      start = new Date();
      start.setDate(end.getDate() - preset.days);
      start.setHours(0, 0, 0, 0); // Set to start of day
    }
    
    setLocalStartDate(start.toISOString().split('T')[0]);
    setLocalEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-white">Select Date Range</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2">
        {datePresets.map((preset) => (
          <button 
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
              activePreset === preset.label 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      <div className="border-t border-gray-700 my-3 pt-3">
        <span className="text-xs text-gray-400 mb-2 block">Or select custom range:</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={localStartDate}
                onChange={(e) => {
                  setLocalStartDate(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full pl-2 pr-8 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={localEndDate}
                min={localStartDate} // Prevent selecting dates before start date
                onChange={(e) => {
                  setLocalEndDate(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full pl-2 pr-8 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date range info */}
      {localStartDate && localEndDate && (
        <div className="bg-gray-700/50 p-2 rounded text-center text-sm">
          <span className="text-gray-300">
            {new Date(localStartDate).toLocaleDateString()} - {new Date(localEndDate).toLocaleDateString()}
          </span>
          <div className="text-xs text-blue-300 mt-1">
            {Math.round((new Date(localEndDate) - new Date(localStartDate)) / (1000 * 60 * 60 * 24) + 1)} days
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          Apply Range
        </button>
      </div>
    </div>
  );
}
