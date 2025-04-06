import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { menuRoutes, AppRouteObject } from '@/router';

const { Sider } = Layout;
const { SubMenu } = Menu;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 处理路径匹配，设置当前选中和展开的菜单
  useEffect(() => {
    const pathname = location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);

    // 设置当前选中的菜单
    setSelectedKeys([pathname]);

    // 不在折叠状态时设置展开的菜单
    if (!collapsed && pathSegments.length > 1) {
      const parentKeys = [];
      let currentPath = '';

      for (let i = 0; i < pathSegments.length - 1; i++) {
        currentPath += `/${pathSegments[i]}`;
        parentKeys.push(currentPath);
      }

      setOpenKeys(parentKeys);
    }
  }, [location.pathname, collapsed]);

  // 处理子菜单打开状态
  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 递归生成菜单项
  const renderMenuItems = (routes: AppRouteObject[], parentPath: string = '') => {
    return routes
      .filter(route => !route.meta?.hideInMenu)
      .map(route => {
        const routePath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`;

        // 如果有子菜单且不是隐藏的
        if (route.children && route.children.filter(child => !child.meta?.hideInMenu).length > 0) {
          return (
            <SubMenu key={routePath} icon={route.meta?.icon} title={route.meta?.title || route.path} className="text-gray-700">
              {renderMenuItems(route.children, routePath)}
            </SubMenu>
          );
        }

        // 无子菜单的普通菜单项
        return (
          <Menu.Item key={routePath} icon={route.meta?.icon} className="text-gray-700">
            <Link to={routePath}>{route.meta?.title || route.path}</Link>
          </Menu.Item>
        );
      });
  };

  return (
    <Sider
      width={240}
      collapsible
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
      className="shadow-md border-r border-gray-200"
      theme="light"
      style={{ backgroundColor: '#fff' }}
      trigger={null} // 移除底部的触发器，使用header中的按钮控制
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white">
        {!collapsed ? <h1 className="text-lg font-bold text-blue-600">React Admin</h1> : <h1 className="text-xl font-bold text-blue-600">RA</h1>}
      </div>

      {/* 菜单 */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={onOpenChange}
        className="border-r-0"
        style={{ borderRight: 0 }}
      >
        {renderMenuItems(menuRoutes)}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
