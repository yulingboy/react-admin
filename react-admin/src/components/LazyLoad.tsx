import React, { Suspense, ComponentType, ReactElement, JSX } from 'react';

interface LoadingProps {
  message?: string;
}

const DefaultLoading: React.FC<LoadingProps> = ({ message = '加载中...' }) => (
  <div className="size-full flex flex-col items-center justify-center min-h-[200px]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

interface LazyLoadProps<T> {
  component: React.LazyExoticComponent<ComponentType<T>>;
  fallback?: ReactElement;
  props?: T;
}

const LazyLoad = <T extends Record<string, unknown>>({
  component: Component,
  fallback = <DefaultLoading />,
  props = {} as T
}: LazyLoadProps<T>): JSX.Element => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyLoad;
