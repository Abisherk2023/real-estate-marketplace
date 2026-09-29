import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif" }}>
          <h2 style={{ color: "crimson" }}>Something crashed</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error.stack)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}