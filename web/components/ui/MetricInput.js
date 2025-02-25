// web/components/ui/MetricInput.js
import { useState } from 'react';

export default function MetricInput({ label, placeholder, unit, onSubmit }) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!value || isNaN(value) || parseFloat(value) <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(parseFloat(value));
      
      if (success) {
        setValue('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting value:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="pl-3 pr-10 py-2 bg-gray-800 border border-blue-500/30 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white w-32"
            disabled={isSubmitting}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              {unit}
            </span>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !value}
          className={`px-4 py-2 rounded-md text-white ${
            isSubmitting || !value
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : showSuccess ? (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            'Add'
          )}
        </button>
        
        <span className="text-sm text-gray-400">{label}</span>
      </form>
    </div>
  );
}
