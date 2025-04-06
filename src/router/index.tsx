import { lazyLoadHelper } from '@/utils/lazyLoadHelper';
import React from 'react';
import { Navigate, useRoutes, RouteObject } from 'react-router-dom';
import { HomeOutlined, DashboardOutlined, SettingOutlined, TableOutlined, FormOutlined } from '@ant-design/icons';
import AuthRoute from '@/components/AuthRoute';

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

// 使用别名导入组件
const Layout = lazyLoadHelper(() => import('@/layout'));
const Home = lazyLoadHelper(() => import('@/pages/Home'));
const Dashboard = lazyLoadHelper(() => import('@/pages/Dashboard'));
const UserManage = lazyLoadHelper(() => import('@/pages/System/UserManage'));
const RoleManage = lazyLoadHelper(() => import('@/pages/System/RoleManage'));
const BasicForm = lazyLoadHelper(() => import('@/pages/Form/BasicForm'));
const AdvancedForm = lazyLoadHelper(() => import('@/pages/Form/AdvancedForm'));
const BasicTable = lazyLoadHelper(() => import('@/pages/Table/BasicTable'));
const Login = lazyLoadHelper(() => import('@/pages/Login'));
const NotFound = lazyLoadHelper(() => import('@/pages/NotFound'));

// 定义路由配置，包含菜单信息
const routes: AppRouteObject[] = [
  {
    path: '/',
    // 使用 AuthRoute 保护主布局及其所有子路由
    element: (
      <AuthRoute>
        <Layout />
      </AuthRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/home" />, meta: { hideInMenu: true } },
      {
        path: 'home',
        element: <Home />,
        meta: {
          title: '首页',
          icon: <HomeOutlined />
        }
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        meta: {
          title: '仪表盘',
          icon: <DashboardOutlined />
        }
      },
      {
        path: 'system',
        meta: {
          title: '系统管理',
          icon: <SettingOutlined />
        },
        children: [
          {
            path: 'user',
            element: <UserManage />,
            meta: {
              title: '用户管理'
            }
          },
          {
            path: 'role',
            element: <RoleManage />,
            meta: {
              title: '角色管理'
            }
          }
        ]
      },
      {
        path: 'form',
        meta: {
          title: '表单页面',
          icon: <FormOutlined />
        },
        children: [
          {
            path: 'basic',
            element: <BasicForm />,
            meta: { title: '基础表单' }
          },
          {
            path: 'advanced',
            element: <AdvancedForm />,
            meta: { title: '高级表单' }
          }
        ]
      },
      {
        path: 'table',
        meta: {
          title: '表格页面',
          icon: <TableOutlined />
        },
        children: [
          {
            path: 'basic',
            element: <BasicTable />,
            meta: { title: '基础表格' }
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    element: <Login />,
    meta: {
      hideInMenu: true
    }
  },
  {
    path: '*',
    element: <NotFound />,
    meta: {
      hideInMenu: true
    }
  }
];

// 导出完整路由配置，供面包屑组件使用
export { routes };

export default function Router(): React.ReactElement | null {
  return useRoutes(routes as unknown as RouteObject[]);
}

// 导出路由配置，供Layout组件使用
export const menuRoutes = routes[0]?.children?.filter(route => !route.meta?.hideInMenu) || [];
