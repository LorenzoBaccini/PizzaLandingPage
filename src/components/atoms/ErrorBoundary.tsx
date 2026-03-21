import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}>
          <p>Qualcosa è andato storto. Ricarica la pagina.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: "8px 20px",
              background: "var(--color-amber)",
              color: "var(--color-bg)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Ricarica
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
