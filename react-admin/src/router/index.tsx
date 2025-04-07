import React from 'react';
import { useRoutes, RouteObject } from 'react-router-dom';
import { routes } from './routes';
export { routes } from './routes';
export { menuRoutes } from './menuRoutes';
export type { AppRouteObject } from './types';

export default function Router(): React.ReactElement | null {
  return useRoutes(routes as unknown as RouteObject[]);
}
