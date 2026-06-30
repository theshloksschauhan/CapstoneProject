import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6 text-center text-[#F3F4F6]">
          <div>
            <h1 className="font-display mb-2 text-2xl font-bold">Something went wrong</h1>
            <p className="mb-6 text-[#9CA3AF]">Please refresh the page or return to the dashboard.</p>
            <a href="/app" className="rounded-full bg-[#0066FF] px-5 py-2 text-sm text-white">
              Go to dashboard
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
