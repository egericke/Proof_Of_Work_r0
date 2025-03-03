// web/components/ErrorBoundary.js
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Enhanced error logging for debugging
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, info);
    
    // Special handling for common map errors
    if (error && error.message && error.message.includes('undefined (reading')) {
      console.error('MAP ERROR DETECTED: This is likely a null/undefined being passed to .map(). Check your component data.');
      
      // Log component props for debugging
      console.error('Component props:', this.props);
    }
    
    // Add reporting to any monitoring tools if available
    if (typeof window !== 'undefined' && window.errorReporter) {
      window.errorReporter.captureException(error, {
        extra: {
          componentName: this.props.componentName,
          componentStack: info.componentStack
        }
      });
    }
  }

  render() {
    if (this.state.error) {
      let errorMessage = "Unknown error";
      
      // Safely extract error message
      try {
        if (this.state.error) {
          if (typeof this.state.error === 'string') {
            errorMessage = this.state.error;
          } else if (this.state.error.message) {
            errorMessage = this.state.error.message;
          }
        }
      } catch (e) {
        errorMessage = "Error message extraction failed";
      }
      
      // Special handling for map errors to display more useful information
      if (errorMessage.includes('map') || errorMessage.includes('Cannot read properties of undefined')) {
        return (
          <div className="text-white p-6 bg-red-900 bg-opacity-30 rounded-lg border border-red-500">
            <h2 className="text-xl font-bold text-red-400 mb-3">
              {this.props.componentName || 'Component'} Error
            </h2>
            <div className="mb-4">
              <p className="mb-2">{errorMessage}</p>
              <p className="text-sm text-gray-300">
                This is likely due to a data structure that wasn't fully loaded when the component tried to render.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }
      
      // Default error rendering
      return (
        <div className="text-white p-6 bg-red-900 bg-opacity-30 rounded-lg border border-red-500">
          <h2 className="text-xl font-bold text-red-400 mb-3">
            Error in {this.props.componentName || 'Component'}
          </h2>
          <p className="mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
