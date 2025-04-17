import { Navigate } from 'react-router-dom';
import { HomeOutlined, DashboardOutlined, SettingOutlined, TableOutlined, FormOutlined, CodeOutlined, DatabaseOutlined, ApiOutlined, LineChartOutlined, DashboardFilled, FileTextOutlined } from '@ant-design/icons';
import { lazyLoadHelper } from '@/utils/lazyLoadHelper';
import AuthRoute from '@/components/AuthRoute';
import { AppRouteObject } from './types';

// 使用别名导入组件
const Layout = lazyLoadHelper(() => import('@/layout'));
const Home = lazyLoadHelper(() => import('@/pages/Home'));
const Dashboard = lazyLoadHelper(() => import('@/pages/Dashboard'));
const UserManage = lazyLoadHelper(() => import('@/pages/System/UserManage'));
const RoleManage = lazyLoadHelper(() => import('@/pages/System/RoleManage'));
const DictionaryManage = lazyLoadHelper(() => import('@/pages/System/DictionaryManage'));
const CodeGenerator = lazyLoadHelper(() => import('@/pages/Tools/CodeGenerator'));
const SqlExecutor = lazyLoadHelper(() => import('@/pages/Tools/SqlExecutor'));
const ApiTester = lazyLoadHelper(() => import('@/pages/Tools/ApiTester'));
const DbManager = lazyLoadHelper(() => import('@/pages/Tools/DbManager'));
const SystemResourceMonitor = lazyLoadHelper(() => import('@/pages/Tools/SystemResourceMonitor'));
const ApiMonitor = lazyLoadHelper(() => import('@/pages/Tools/ApiMonitor'));
const LogMonitor = lazyLoadHelper(() => import('@/pages/Tools/LogMonitor'));
const BasicForm = lazyLoadHelper(() => import('@/pages/Form/BasicForm'));
const AdvancedForm = lazyLoadHelper(() => import('@/pages/Form/AdvancedForm'));
const BasicTable = lazyLoadHelper(() => import('@/pages/Table/BasicTable'));
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
          },
          {
            path: 'dictionary',
            element: <DictionaryManage />,
            meta: {
              title: '字典管理'
            }
          },
          
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
              title: '接口测试',
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
              title: 'SQL执行器',
            }
          },
          {
            path: 'db-manager',
            element: <DbManager />,
            meta: {
              title: '数据库管理',
            }
          },
          {
            path: 'system-resources',
            element: <SystemResourceMonitor />,
            meta: {
              title: '系统资源监控',
              icon: <DashboardFilled />
            }
          },
          {
            path: 'api-monitor',
            element: <ApiMonitor />,
            meta: {
              title: 'API监控',
              icon: <ApiOutlined />
            }
          },
          {
            path: 'log-monitor',
            element: <LogMonitor />,
            meta: {
              title: '日志统计',
              icon: <FileTextOutlined />
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
