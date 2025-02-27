// web/components/DebugPanel.js
import { useState } from 'react';

export default function DebugPanel({ supabase }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test connection to Supabase by trying to fetch a single row
      const { data, error } = await supabase
        .from('workout_stats')
        .select('*')
        .limit(1);
      
      if (error) {
        throw new Error(`Database connection error: ${error.message}`);
      }
      
      setTestResult({
        success: true,
        message: `Successfully connected to Supabase. Data received: ${JSON.stringify(data)}`
      });
    } catch (error) {
      console.error('Database connection test failed:', error);
      setTestResult({
        success: false,
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    const variables = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    
    const missingVars = Object.keys(variables).filter(key => !variables[key]);
    
    if (missingVars.length === 0) {
      setTestResult({
        success: true,
        message: 'All environment variables are set.'
      });
    } else {
      setTestResult({
        success: false,
        message: `Missing environment variables: ${missingVars.join(', ')}`
      });
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg"
        title="Open Debug Panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 w-full max-w-md z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Dashboard Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testDatabaseConnection}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Testing Connection...' : 'Test Database Connection'}
          </button>
        </div>
        
        <div>
          <button
            onClick={checkEnvironmentVariables}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Check Environment Variables
          </button>
        </div>
        
        {testResult && (
          <div className={`p-3 rounded ${testResult.success ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
            <h4 className={`font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.success ? 'Success' : 'Error'}
            </h4>
            <pre className="text-sm whitespace-pre-wrap mt-1 text-gray-300">
              {testResult.message}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-400">
          <p>This panel is for development and debugging purposes only.</p>
        </div>
      </div>
    </div>
  );
}
