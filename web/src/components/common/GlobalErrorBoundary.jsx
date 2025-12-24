import React from 'react';
import { withTranslation } from '@/hooks/useTranslation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { createPageUrl } from "@/utils";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Global Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = createPageUrl('Dashboard');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 p-8 max-w-lg w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {this.props.t('errors.boundaryTitle')}
              </h1>
              <p className="text-slate-400 text-sm">
                {this.props.t('errors.globalMessage')}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-slate-800 rounded-lg text-left">
                <p className="text-xs font-mono text-red-400 mb-2">{this.state.error.toString()}</p>
                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer hover:text-slate-400">
                    {this.props.t('errors.stackTrace')}
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-40">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.props.t('errors.globalReload')}
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                <Home className="w-4 h-4 mr-2" />
                {this.props.t('errors.globalHome')}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(GlobalErrorBoundary);
