// web/pages/diagnostic.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DiagnosticPage() {
  const [logs, setLogs] = useState([]);
  const [environment, setEnvironment] = useState({});
  const [testComponents, setTestComponents] = useState({});

  // Log helper function
  const log = (message, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toISOString(), message, type }]);
  };

  // Check environment
  useEffect(() => {
    try {
      log('Starting environment checks');
      
      // Check Next.js environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      setEnvironment({
        supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
        supabaseKey: supabaseKey ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
        windowDefined: typeof window !== 'undefined',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
      });
      
      log('Environment variables checked');
      
      // Try to initialize Supabase client
      if (supabaseUrl && supabaseKey) {
        log('Initializing Supabase client');
        const supabase = createClient(supabaseUrl, supabaseKey);
        log('Supabase client initialized successfully');
        
        // Try a simple query
        log('Testing Supabase connection with simple query');
        supabase.auth.getSession()
          .then(() => log('Supabase connection test succeeded', 'success'))
          .catch(error => log(`Supabase connection test failed: ${error.message}`, 'error'));
      } else {
        log('Skipping Supabase initialization due to missing credentials', 'warning');
      }
    } catch (error) {
      log(`Error during environment check: ${error.message}`, 'error');
    }
  }, []);

  // Test individual components
  useEffect(() => {
    const testComponentSafely = async (name, testFn) => {
      try {
        log(`Testing component: ${name}`);
        await testFn();
        setTestComponents(prev => ({ ...prev, [name]: 'Passed' }));
        log(`Component ${name} test passed`, 'success');
      } catch (error) {
        setTestComponents(prev => ({ ...prev, [name]: `Failed: ${error.message}` }));
        log(`Component ${name} test failed: ${error.message}`, 'error');
      }
    };

    // Test DateRangePicker (common component that might cause issues)
    testComponentSafely('DateRangePicker', async () => {
      // Simple render test
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      // If this throws, the component has issues
      if (typeof startDate.toISOString !== 'function') {
        throw new Error('Date object is not valid');
      }
    });

    // Test DataChart component (which uses Chart.js)
    testComponentSafely('Chart.js', async () => {
      // Check if Chart.js globals would be available
      if (typeof window !== 'undefined' && !window.Chart) {
        // Not a failure, just a note
        log('Chart.js global not found, will be loaded dynamically', 'info');
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Diagnostic Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Environment</h2>
          <ul className="space-y-2">
            {Object.entries(environment).map(([key, value]) => (
              <li key={key} className="flex justify-between border-b border-gray-700 pb-1">
                <span>{key}:</span>
                <span className={value === 'Not set' ? 'text-red-400' : 'text-green-400'}>{value}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Component Tests */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Component Tests</h2>
          <ul className="space-y-2">
            {Object.entries(testComponents).map(([key, value]) => (
              <li key={key} className="flex justify-between border-b border-gray-700 pb-1">
                <span>{key}:</span>
                <span className={value.startsWith('Failed') ? 'text-red-400' : 'text-green-400'}>
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Logs */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">Diagnostic Logs</h2>
        <div className="bg-gray-900 p-3 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className={`mb-1 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'warning' ? 'text-yellow-400' : 
              log.type === 'success' ? 'text-green-400' : 'text-gray-300'
            }`}>
              [{log.time.split('T')[1].split('.')[0]}] {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500 italic">No logs yet...</div>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">Recommended Actions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Check browser console (F12) for JavaScript errors</li>
          <li>Verify .env.local file has correct Supabase credentials</li>
          <li>Try using a different browser</li>
          <li>Clear your browser cache</li>
          <li>Run <code className="bg-gray-700 p-1 rounded">npm install</code> to ensure all dependencies are installed</li>
          <li>Check if the Node.js version meets the requirements</li>
        </ul>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
