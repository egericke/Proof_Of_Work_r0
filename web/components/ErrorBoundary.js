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
    console.error(`Error in ${this.props.componentName}:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
          <h2>Error in {this.props.componentName}</h2>
          <p>{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
