import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: error.stack || 'No stack trace available'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error to monitoring service if available
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Only log in production
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={this.handleReset}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-abyss-dark via-abyss-dark to-abyss-teal/10 text-abyss-ethereal flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-abyss-amber" />
              </div>
              <CardTitle className="text-abyss-ethereal">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-abyss-muted text-center">
                The application encountered an unexpected error. This has been logged for investigation.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-abyss-dark/50 p-3 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-sm font-mono">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-300 mt-2 overflow-auto max-h-32">
                      {this.state.errorInfo}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex justify-center space-x-2">
                <Button
                  onClick={this.handleReset}
                  className="bg-abyss-teal hover:bg-abyss-teal/80 text-abyss-dark"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-abyss-teal/50 text-abyss-ethereal hover:bg-abyss-teal/10"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;