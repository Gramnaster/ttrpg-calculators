import { Component, type ErrorInfo, type ReactNode } from "react";

export interface CalculatorErrorBoundaryProps {
  children: ReactNode;
}

interface CalculatorErrorBoundaryState {
  hasError: boolean;
}

// React has no hook-based error boundary API — a class component is required here (rules/error-handling.md).
export class CalculatorErrorBoundary extends Component<
  CalculatorErrorBoundaryProps,
  CalculatorErrorBoundaryState
> {
  state: CalculatorErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CalculatorErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Calculator crashed:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <p role="alert" className="text-accent">
          Something went wrong in this calculator.
        </p>
      );
    }
    return this.props.children;
  }
}
