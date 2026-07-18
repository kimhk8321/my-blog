import type { ComponentType } from "react";
import { Demo } from "@/components/mdx/demo";
import { MiniHooksDemo } from "@/components/mdx/mini-hooks-demo";
import { MiniStoreDemo } from "@/components/mdx/mini-store-demo";
import { VirtualListDemo } from "@/components/mdx/virtual-list-demo";
import { ConcurrentSearchDemo } from "@/components/mdx/concurrent-search-demo";
import { MiniRouterDemo } from "@/components/mdx/mini-router-demo";
import { KeyBugDemo } from "@/components/mdx/key-bug-demo";
import { PromiseOrderDemo } from "@/components/mdx/promise-order-demo";
import { FlexboxDemo } from "@/components/mdx/flexbox-demo";
import { DebounceThrottleDemo } from "@/components/mdx/debounce-throttle-demo";
import { ReducerTodoDemo } from "@/components/mdx/reducer-todo-demo";
import { UseDebounceDemo } from "@/components/mdx/use-debounce-demo";
import { ContextThemeDemo } from "@/components/mdx/context-theme-demo";
import { ErrorBoundaryDemo } from "@/components/mdx/error-boundary-demo";
import { OptimisticLikeDemo } from "@/components/mdx/optimistic-like-demo";
import { RerenderCountDemo } from "@/components/mdx/rerender-count-demo";
import { HeadlessTabsDemo } from "@/components/mdx/headless-tabs-demo";
import { InfiniteScrollDemo } from "@/components/mdx/infinite-scroll-demo";
import { ViewTransitionDemo } from "@/components/mdx/view-transition-demo";
import { WebWorkerDemo } from "@/components/mdx/web-worker-demo";
import { DragSortDemo } from "@/components/mdx/drag-sort-demo";
import { StateMachineDemo } from "@/components/mdx/state-machine-demo";
import { SuspenseUseDemo } from "@/components/mdx/suspense-use-demo";
import { FocusTrapModalDemo } from "@/components/mdx/focus-trap-modal-demo";

type MdxComponent = ComponentType<Record<string, unknown>>;

// MDX 본문에서 <Demo>, <MiniHooksDemo /> 처럼 쓸 수 있는 컴포넌트들
export const mdxComponents: Record<string, MdxComponent> = {
  Demo: Demo as MdxComponent,
  MiniHooksDemo: MiniHooksDemo as MdxComponent,
  MiniStoreDemo: MiniStoreDemo as MdxComponent,
  VirtualListDemo: VirtualListDemo as MdxComponent,
  ConcurrentSearchDemo: ConcurrentSearchDemo as MdxComponent,
  MiniRouterDemo: MiniRouterDemo as MdxComponent,
  KeyBugDemo: KeyBugDemo as MdxComponent,
  PromiseOrderDemo: PromiseOrderDemo as MdxComponent,
  FlexboxDemo: FlexboxDemo as MdxComponent,
  DebounceThrottleDemo: DebounceThrottleDemo as MdxComponent,
  ReducerTodoDemo: ReducerTodoDemo as MdxComponent,
  UseDebounceDemo: UseDebounceDemo as MdxComponent,
  ContextThemeDemo: ContextThemeDemo as MdxComponent,
  ErrorBoundaryDemo: ErrorBoundaryDemo as MdxComponent,
  OptimisticLikeDemo: OptimisticLikeDemo as MdxComponent,
  RerenderCountDemo: RerenderCountDemo as MdxComponent,
  HeadlessTabsDemo: HeadlessTabsDemo as MdxComponent,
  InfiniteScrollDemo: InfiniteScrollDemo as MdxComponent,
  ViewTransitionDemo: ViewTransitionDemo as MdxComponent,
  WebWorkerDemo: WebWorkerDemo as MdxComponent,
  DragSortDemo: DragSortDemo as MdxComponent,
  StateMachineDemo: StateMachineDemo as MdxComponent,
  SuspenseUseDemo: SuspenseUseDemo as MdxComponent,
  FocusTrapModalDemo: FocusTrapModalDemo as MdxComponent,
};
