import LazyLoad from '@/components/LazyLoad';
import React, { ComponentType, JSX } from 'react';

// 工具函数 - 用于简化懒加载组件的创建
export const lazyLoadHelper = <T extends Record<string, unknown>>(importFunc: () => Promise<{ default: ComponentType<T> }>) => {
  const LazyComponent = React.lazy(importFunc);
  return (props?: T): JSX.Element => <LazyLoad<T> component={LazyComponent} props={props} />;
};
