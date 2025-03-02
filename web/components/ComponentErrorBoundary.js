// web/components/ComponentErrorBoundary.js
import React from 'react';

class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in component "${this.props.componentName}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-500 text-white">
          <h3 className="text-lg font-medium text-red-300 mb-2">{this.props.componentName} Error</h3>
          <p className="mb-3 text-gray-300">This component encountered an error and couldn't be displayed.</p>
          {this.state.error && (
            <div className="text-sm bg-gray-900/50 p-3 rounded overflow-auto max-h-32">
              <p className="font-mono text-red-300">{this.state.error.toString()}</p>
            </div>
          )}
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
