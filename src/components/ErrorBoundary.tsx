import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

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
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = async () => {
    try {
      localStorage.removeItem('capibara_playback_state');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 shadow-lg shadow-orange-500/5">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Capibara Sound se ha recuperado
          </h1>
          <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
            Ocurrió un problema temporal al cargar la interfaz. Puedes recargar la aplicación o restaurar el estado para solucionar la pantalla en blanco de inmediato.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs mb-6">
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar Pantalla</span>
            </button>

            <button
              onClick={this.handleResetAndReload}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border border-neutral-700 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Limpiar Caché</span>
            </button>
          </div>

          {this.state.error && (
            <details className="w-full max-w-md text-left bg-neutral-900/80 p-3 rounded-lg border border-neutral-800 text-xs text-neutral-400">
              <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white">
                Ver detalle del error
              </summary>
              <pre className="mt-2 text-[11px] font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
