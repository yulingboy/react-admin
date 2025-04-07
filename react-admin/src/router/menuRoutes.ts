import { routes } from './routes';

// 导出路由配置，供Layout组件使用
export const menuRoutes = routes[0]?.children?.filter(route => !route.meta?.hideInMenu) || [];
