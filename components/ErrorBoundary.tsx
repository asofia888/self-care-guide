import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    logError('ErrorBoundary', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cream-50 to-cream-100">
          <div className="max-w-md w-full bg-white/90 rounded-[1.8rem] shadow-elegant p-8 border border-cream-200 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-full mb-5 ring-1 ring-rose-100">
                <svg
                  className="w-8 h-8 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-medium text-stone-800 mb-2">
                問題が発生しました
              </h2>
              <p className="text-stone-500 leading-relaxed mb-6">
                アプリケーションでエラーが発生しました。ページを再読み込みしてください。
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="text-left mb-6 p-4 bg-cream-50 rounded-xl border border-cream-200">
                  <summary className="cursor-pointer font-medium text-stone-600 mb-2">
                    エラー詳細
                  </summary>
                  <pre className="text-xs text-rose-500 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-champagne-400 to-champagne-500 text-white font-medium rounded-full shadow-soft hover:shadow-elegant transition-all duration-300"
                >
                  再試行
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-cream-100 text-stone-600 font-medium rounded-full hover:bg-cream-200 transition-colors duration-300"
                >
                  ページを再読み込み
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
