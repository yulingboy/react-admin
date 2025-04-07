import React from 'react';
import { RouteObject } from 'react-router-dom';

// 扩展路由对象类型以支持菜单信息
export interface AppRouteObject extends Omit<RouteObject, 'children'> {
  path: string;
  element?: React.ReactNode;
  children?: AppRouteObject[];
  redirect?: string;
  // 菜单相关配置
  meta?: {
    title?: string; // 菜单标题
    icon?: React.ReactNode; // 菜单图标
    hideInMenu?: boolean; // 是否在菜单中隐藏
    order?: number; // 排序
    isLink?: boolean; // 是否为外部链接
    target?: '_blank' | '_self'; // 链接打开方式
  };
}
