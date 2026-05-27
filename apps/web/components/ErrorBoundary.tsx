"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

// TODO(issue): #T4 — Implement error boundary system across dApp
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-white text-center">
          <h2 className="text-xl font-bold">Something went wrong.</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-primary rounded-lg text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
