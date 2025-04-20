import { ReactElement, ReactNode } from 'react';

// 布局组件的Props类型
export interface LayoutProps {
  children?: ReactNode;
}

// 页面组件的基础Props类型
export interface PageProps {
  title?: string;
}

// 路由相关类型
export interface RouteConfig {
  path: string;
  element: ReactElement;
  children?: RouteConfig[];
  redirect?: string;
}
