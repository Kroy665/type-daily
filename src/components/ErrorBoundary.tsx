import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = { error: null };

    public static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ error: null });
    };

    public render() {
        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <div className="grid min-h-screen place-items-center px-4">
                <div className="card w-full max-w-md p-8 text-center">
                    <p className="font-mono text-sm text-danger">error</p>
                    <h1 className="mt-2 text-2xl font-semibold text-fg">Something went wrong</h1>
                    <p className="mt-2 text-sm text-muted">An unexpected error occurred. Try again, or head back home.</p>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-6 overflow-x-auto rounded-lg bg-danger/10 p-3 text-left font-mono text-xs text-danger">
                            {this.state.error.message}
                        </pre>
                    )}
                    <div className="mt-6 flex justify-center gap-3">
                        <button type="button" onClick={this.handleReset} className="btn-primary">
                            Try again
                        </button>
                        {/* Full reload so the app restarts from a clean state */}
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a href="/" className="btn-ghost">
                            Go home
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
