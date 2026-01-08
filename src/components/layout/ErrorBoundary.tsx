import { Component, type ErrorInfo, type ReactNode } from 'react';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
          <div className="max-w-md w-full bg-zinc-800 p-8 rounded-lg shadow-xl border border-red-500/20">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Algo deu errado</h2>
            <p className="text-gray-300 mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {this.state.error && (
              <pre className="bg-black/50 p-4 rounded text-sm text-red-400 overflow-auto mb-6">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
