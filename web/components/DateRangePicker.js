// web/components/DateRangePicker.js
import { useState } from 'react';

export default function DateRangePicker({ dateRange, setDateRange, onClose }) {
  const [localStartDate, setLocalStartDate] = useState(
    dateRange.startDate.toISOString().split('T')[0]
  );
  const [localEndDate, setLocalEndDate] = useState(
    dateRange.endDate.toISOString().split('T')[0]
  );

  const handleApply = () => {
    setDateRange({
      startDate: new Date(localStartDate),
      endDate: new Date(localEndDate)
    });
    onClose();
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
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
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">End Date</label>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600 text-white text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => applyPreset(7)} 
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Last 7 Days
        </button>
        <button 
          onClick={() => applyPreset(30)} 
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Last 30 Days
        </button>
        <button 
          onClick={() => applyPreset(90)} 
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Last 90 Days
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleApply}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
