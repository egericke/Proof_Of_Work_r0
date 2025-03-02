// web/components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-500 text-white">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">The application encountered an error. Try refreshing the page.</p>
          {this.state.error && (
            <div className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded overflow-auto max-h-40">
              <p className="font-mono">{this.state.error.toString()}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/diagnostic'} 
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              Run Diagnostics
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
