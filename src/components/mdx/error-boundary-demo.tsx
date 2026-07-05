"use client";

import { Component, type ReactNode, useState } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  reset = () => {
    this.setState({ hasError: false });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm">
          <p>😵 컴포넌트에서 에러가 발생했습니다.</p>
          <button
            className="mt-2 rounded-md border border-red-500/40 px-3 py-1 text-xs"
            onClick={this.reset}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Bomb({ crashed }: { crashed: boolean }) {
  if (crashed) {
    throw new Error("💥 렌더 중 에러!");
  }
  return (
    <div className="rounded-md bg-foreground/[0.05] p-4 text-sm">
      정상적으로 렌더링 중입니다. 아래 버튼으로 에러를 던져 보세요.
    </div>
  );
}

export function ErrorBoundaryDemo() {
  const [crashed, setCrashed] = useState(false);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <ErrorBoundary onReset={() => setCrashed(false)}>
        <Bomb crashed={crashed} />
      </ErrorBoundary>
      <button
        className="w-fit rounded-md border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-foreground/[0.06] dark:border-white/20"
        onClick={() => setCrashed(true)}
      >
        에러 던지기
      </button>
      <p className="text-xs text-foreground/50">
        자식이 렌더 중 throw하면 앱 전체가 죽는 대신, Error Boundary가 잡아 대체
        UI를 보여줍니다.
      </p>
    </div>
  );
}
