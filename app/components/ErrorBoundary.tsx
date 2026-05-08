import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl text-amber mb-4">Đã xảy ra lỗi</h2>
            <p className="text-white/60 mb-4">
              {this.state.error?.message || "Vui lòng tải lại trang"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-amber text-black rounded-xl hover:scale-105 transition-transform"
            >
              Tải lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
