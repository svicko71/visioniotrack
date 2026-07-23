import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4 p-8 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground break-words">
              {this.state.error?.message?.slice(0, 240) || "An unexpected error occurred."}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.reset}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 rounded-md border border-border text-sm"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
