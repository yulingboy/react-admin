import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Breadcrumb, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { AppRouteObject, routes } from '@/router';
import UserInfoDropdown from './user-info';

const { Header } = Layout;

interface HeaderComponentProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 简化的面包屑生成逻辑
  const generateBreadcrumbs = (): React.ReactNode[] => {
    // 如果是首页，不显示面包屑
    if (location.pathname === '/' || location.pathname === '/home') {
      return [];
    }

    const pathSnippets = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: React.ReactNode[] = [];
    let currentPath = '';

    // 生成每一级路径的面包屑
    pathSnippets.forEach((snippet: string) => {
      currentPath += `/${snippet}`;

      // 查找当前路径对应的路由
      const matchedRoute = findMatchingRoute(currentPath);

      if (matchedRoute) {
        breadcrumbItems.push(
          <Breadcrumb.Item key={currentPath} onClick={() => navigate(currentPath)} className="cursor-pointer hover:text-blue-500">
            {matchedRoute.meta?.title || snippet}
          </Breadcrumb.Item>
        );
      }
    });

    return breadcrumbItems;
  };

  // 简化的路由匹配逻辑
  const findMatchingRoute = (path: string): AppRouteObject | null => {
    // 用于存储找到的路由
    let result: AppRouteObject | null = null;

    // 递归查找匹配路径的路由
    const findRoute = (routesList: AppRouteObject[], targetPath: string, parentPath = ''): void => {
      for (const route of routesList) {
        // 构建当前路由的完整路径
        const fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`.replace(/\/\/+/g, '/');

        // 规范化路径进行比较
        const normalizedPath = fullPath.replace(/\/+$/, '');
        const normalizedTarget = targetPath.replace(/\/+$/, '');

        // 检查路径是否匹配
        if (normalizedPath === normalizedTarget) {
          result = route;
          return;
        }

        // 如果有子路由，继续在子路由中查找
        if (route.children) {
          findRoute(route.children, targetPath, fullPath);
        }
      }
    };

    // 从所有路由中查找
    findRoute(routes, path);
    return result;
  };

  // 计算面包屑
  const breadcrumbs = generateBreadcrumbs();

  return (
    <Header
      className="!bg-white p-0 px-4 flex items-center justify-between shadow-sm border-b border-gray-200"
      style={{ zIndex: 1, height: 'auto', lineHeight: 'normal', padding: '8px 24px' }}
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="mr-4 flex items-center justify-center text-gray-600 hover:text-blue-600"
          style={{ fontSize: '16px', width: 40, height: 40 }}
        />
        <div>
          {/* 只有当面包屑项不为空时才显示面包屑导航 */}
          {breadcrumbs.length > 0 && (
            <div>
              <Breadcrumb>{breadcrumbs}</Breadcrumb>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <UserInfoDropdown></UserInfoDropdown>
      </div>
    </Header>
  );
};

export default HeaderComponent;
