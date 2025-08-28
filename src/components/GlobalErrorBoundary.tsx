import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console in development
    console.error('Application error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    // Clear the error and reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      // Check if this is a Google Maps related error
      const isGoogleMapsError = error?.message?.toLowerCase().includes('google') || 
                               error?.stack?.toLowerCase().includes('google');
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">An error occurred while loading the application.</AlertTitle>
                <AlertDescription className="mt-2 text-red-700">
                  {isGoogleMapsError ? (
                    <>
                      <p className="mb-2">
                        There was a problem loading the Google Maps service. This might be due to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Network connectivity issues</li>
                        <li>Google Maps service temporary unavailability</li>
                        <li>Browser blocking the maps script</li>
                      </ul>
                      <p className="mt-3">
                        You can still use most features of the application without maps.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2">Error Details:</p>
                      <code className="block p-2 bg-gray-100 rounded text-sm mt-2">
                        {error?.message || 'Unknown error occurred'}
                      </code>
                    </>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button onClick={this.handleReset} variant="default">
                  Reload Page
                </Button>
                <Button 
                  onClick={() => window.history.back()} 
                  variant="outline"
                >
                  Go Back
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-6 p-4 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Developer Information (shown in development only)
                  </summary>
                  <pre className="overflow-auto text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}