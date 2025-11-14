import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '../UI';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service (if available)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = async () => {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1 
    });

    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount, isRetrying } = this.state;
      const { fallback: CustomFallback, level = 'component' } = this.props;

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            retryCount={retryCount}
            isRetrying={isRetrying}
          />
        );
      }

      // Default error UI based on error level
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="error-boundary-container"
        >
          <div className={`glass-card p-8 ${level === 'page' ? 'min-h-screen flex items-center justify-center' : ''}`}>
            <div className="text-center max-w-md mx-auto">
              {/* Error Icon with Animation */}
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="text-6xl mb-6"
              >
                {level === 'page' ? '💥' : 
                 level === 'critical' ? '🚨' : 
                 isRetrying ? '🔄' : '⚠️'}
              </motion.div>

              {/* Error Title */}
              <h2 className="text-2xl font-bold text-primary mb-4">
                {isRetrying ? 'Retrying...' :
                 level === 'page' ? 'Something went wrong' :
                 level === 'critical' ? 'Critical Error' :
                 'Component Error'}
              </h2>

              {/* Error Description */}
              <p className="text-secondary mb-6 leading-relaxed">
                {isRetrying ? 
                  `Attempting to recover... (Attempt ${retryCount})` :
                  level === 'page' ? 
                    'The application encountered an unexpected error. This might be a temporary issue.' :
                    'This component failed to load properly. You can try refreshing or continue using other parts of the app.'
                }
              </p>

              {/* Retry Progress */}
              {isRetrying && (
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-secondary mb-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                    />
                    <span>Recovering component...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isRetrying && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <AnimatedButton 
                    variant="primary" 
                    onClick={this.handleRetry}
                    className="glass-button hover-lift"
                  >
                    🔄 Try Again
                  </AnimatedButton>
                  
                  {level === 'page' && (
                    <AnimatedButton 
                      variant="outline" 
                      onClick={this.handleReload}
                      className="glass-button-outlined hover-lift"
                    >
                      ↻ Reload Page
                    </AnimatedButton>
                  )}
                  
                  <AnimatedButton 
                    variant="ghost" 
                    onClick={this.handleGoHome}
                    className="glass-button-outlined hover-lift"
                  >
                    🏠 Go Home
                  </AnimatedButton>
                </div>
              )}

              {/* Error Details (Collapsible) */}
              {error && process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="text-xs text-secondary cursor-pointer hover:text-primary mb-2">
                    🔍 Technical Details (Development)
                  </summary>
                  <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono text-gray-600 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.toString()}
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <strong>Retry Count:</strong> {retryCount}
                    </div>
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="mt-6 text-xs text-secondary">
                {level === 'page' ? 
                  'If this problem persists, please contact support.' :
                  'Other parts of the application should continue to work normally.'
                }
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  return (error, errorInfo) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Report to monitoring service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  };
}

export default ErrorBoundary;