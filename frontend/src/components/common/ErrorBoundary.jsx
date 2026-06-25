import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("UI error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl">
          <h2 className="font-display text-3xl text-slate-900">
            Something went wrong
          </h2>
          <p className="mt-3 text-slate-600">
            Refresh the page or head back home. The rest of the project is still
            safe.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
