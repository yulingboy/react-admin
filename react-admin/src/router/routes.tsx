import { Navigate } from 'react-router-dom';
import {
  HomeOutlined,
  DashboardOutlined,
  SettingOutlined,
  TableOutlined,
  FormOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ApiOutlined,
  LineChartOutlined,
  DashboardFilled,
  FileTextOutlined
} from '@ant-design/icons';
import { lazyLoadHelper } from '@/utils/lazyLoadHelper';
import AuthRoute from '@/components/AuthRoute';
import { AppRouteObject } from './types';
import Dashboard from '@/pages/Dashboard';

// 使用别名导入组件
const Layout = lazyLoadHelper(() => import('@/layout'));


// System模块
const UserManage = lazyLoadHelper(() => import('@/modules/system/pages/user-management'));
const RoleManage = lazyLoadHelper(() => import('@/modules/system/pages/role-management'));
const DictionaryManage = lazyLoadHelper(() => import('@/modules/system/pages/dictionary-management'));
const ConfigManage = lazyLoadHelper(() => import('@/modules/system/pages/config-management'));
const NotificationManage = lazyLoadHelper(() => import('@/modules/system/pages/notification-management'));

// Tools模块
const CodeGenerator = lazyLoadHelper(() => import('@/modules/tools/pages/code-generator'));
const SqlExecutor = lazyLoadHelper(() => import('@/modules/tools/pages/sql-executor'));
const ApiTester = lazyLoadHelper(() => import('@/modules/tools/pages/api-tester'));
const DbManager = lazyLoadHelper(() => import('@/modules/tools/pages/db-manager'));

// Monitoring模块
const SystemResourceMonitor = lazyLoadHelper(() => import('@/modules/monitoring/pages/system-resource-monitor'));
const ApiMonitor = lazyLoadHelper(() => import('@/modules/monitoring/pages/api-monitor'));
const LogMonitor = lazyLoadHelper(() => import('@/modules/monitoring/pages/log-monitor'));


// 登录和404页面
const Login = lazyLoadHelper(() => import('@/pages/Login'));
const NotFound = lazyLoadHelper(() => import('@/pages/NotFound'));

// 定义路由配置，包含菜单信息
export const routes: AppRouteObject[] = [
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
        element: <Dashboard />,
        meta: {
          title: '首页',
          icon: <HomeOutlined />
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
          },
          {
            path: 'dictionary',
            element: <DictionaryManage />,
            meta: {
              title: '字典管理'
            }
          },
          {
            path: 'config',
            element: <ConfigManage />,
            meta: {
              title: '配置管理'
            }
          },
          {
            path: 'notification',
            element: <NotificationManage />,
            meta: {
              title: '通知管理'
            }
          }
        ]
      },
      {
        path: 'tools',
        meta: {
          title: '系统工具',
          icon: <CodeOutlined />
        },
        children: [
          {
            path: 'api-tester',
            element: <ApiTester />,
            meta: {
              title: '接口测试'
            }
          },
          {
            path: 'code-generator',
            element: <CodeGenerator />,
            meta: {
              title: '代码生成器'
            }
          },
          {
            path: 'sql-executor',
            element: <SqlExecutor />,
            meta: {
              title: 'SQL执行器'
            }
          },
          {
            path: 'db-manager',
            element: <DbManager />,
            meta: {
              title: '数据库管理'
            }
          }
        ]
      },
      {
        path: 'monitoring',
        meta: {
          title: '系统监控',
          icon: <LineChartOutlined />
        },
        children: [
          {
            path: 'system-resources',
            element: <SystemResourceMonitor />,
            meta: {
              title: '系统资源监控'
            }
          },
          {
            path: 'api-monitor',
            element: <ApiMonitor />,
            meta: {
              title: 'API监控'
            }
          },
          {
            path: 'log-monitor',
            element: <LogMonitor />,
            meta: {
              title: '日志统计'
            }
          }
        ]
      },
    ]
  },
  {
    path: 'login',
    element: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    ),
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
