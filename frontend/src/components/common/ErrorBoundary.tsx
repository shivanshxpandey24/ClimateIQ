import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AeroResilience Error:', error.message);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="bg-gray-900 border border-red-800 rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-900/40 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">⚠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Application Error</h1>
                <p className="text-gray-400 text-sm">AeroResilience encountered an unexpected problem</p>
              </div>
            </div>

            <div className="bg-gray-950 rounded-lg p-4 mb-6 border border-gray-800">
              <p className="text-red-400 font-mono text-sm break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Reload App
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>

            <p className="text-gray-600 text-xs mt-4 text-center">
              Check the browser console for detailed error information
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
