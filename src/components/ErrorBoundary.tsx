import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Ops! Algo deu errado
              </h1>
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado. Por favor, tente recarregar a página.
              </p>
            </div>

            <Button
              onClick={this.handleReload}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar página
            </Button>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Detalhes do erro (dev)
                </summary>
                <pre className="mt-2 text-xs text-destructive overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
