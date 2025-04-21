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
  FileTextOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  ToolOutlined,
  FileSearchOutlined,
  ProfileOutlined,
  WalletOutlined,
  AccountBookOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  BankOutlined,
  TagOutlined,
  BarChartOutlined
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
const ScheduleJobManage = lazyLoadHelper(() => import('@/pages/system/schedule-job'));
const LoginLogManage = lazyLoadHelper(() => import('@/modules/system/pages/login-log'));
const OperLogManage = lazyLoadHelper(() => import('@/modules/system/pages/oper-log'));

// Tools模块
const CodeGenerator = lazyLoadHelper(() => import('@/modules/tools/pages/code-generator'));
const SqlExecutor = lazyLoadHelper(() => import('@/modules/tools/pages/sql-executor'));
const ApiTester = lazyLoadHelper(() => import('@/modules/tools/pages/api-tester'));
const DbManager = lazyLoadHelper(() => import('@/modules/tools/pages/db-manager'));

// Monitoring模块
const SystemResourceMonitor = lazyLoadHelper(() => import('@/modules/monitoring/pages/system-resource-monitor'));
const ApiMonitor = lazyLoadHelper(() => import('@/modules/monitoring/pages/api-monitor'));
const LogMonitor = lazyLoadHelper(() => import('@/modules/monitoring/pages/log-monitor'));

// Finance模块
const AccountTypes = lazyLoadHelper(() => import('@/modules/finance/pages/account-types'));
const Accounts = lazyLoadHelper(() => import('@/modules/finance/pages/accounts'));
const BillCategories = lazyLoadHelper(() => import('@/modules/finance/pages/bill-categories'));
const Bills = lazyLoadHelper(() => import('@/modules/finance/pages/bills'));
const Budgets = lazyLoadHelper(() => import('@/modules/finance/pages/budgets'));
const BillStatistics = lazyLoadHelper(() => import('@/modules/finance/pages/statistics'));
const BillTags = lazyLoadHelper(() => import('@/modules/finance/pages/bill-tags'));
const BillImports = lazyLoadHelper(() => import('@/modules/finance/pages/bill-imports'));

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
          },
          {
            path: 'schedule-job',
            element: <ScheduleJobManage />,
            meta: {
              title: '定时任务',
              icon: <ClockCircleOutlined />
            }
          },
          {
            path: 'login-log',
            element: <LoginLogManage />,
            meta: {
              title: '登录日志',
              icon: <KeyOutlined />
            }
          },
          {
            path: 'oper-log',
            element: <OperLogManage />,
            meta: {
              title: '操作日志',
              icon: <ProfileOutlined />
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
      {
        path: 'finance',
        meta: {
          title: '记账理财',
          icon: <WalletOutlined />
        },
        children: [
          {
            path: 'accounts',
            element: <Accounts />,
            meta: {
              title: '账户管理',
              icon: <BankOutlined />
            }
          },
          {
            path: 'account-types',
            element: <AccountTypes />,
            meta: {
              title: '账户类型',
              icon: <CreditCardOutlined />
            }
          },
          {
            path: 'bill-categories',
            element: <BillCategories />,
            meta: {
              title: '账单分类',
              icon: <ProfileOutlined />
            }
          },
          {
            path: 'bills',
            element: <Bills />,
            meta: {
              title: '账单管理',
              icon: <AccountBookOutlined />
            }
          },
          {
            path: 'budgets',
            element: <Budgets />,
            meta: {
              title: '预算管理',
              icon: <TransactionOutlined />
            }
          },
          {
            path: 'statistics',
            element: <BillStatistics />,
            meta: {
              title: '统计分析',
              icon: <BarChartOutlined />
            }
          },
          {
            path: 'bill-tags',
            element: <BillTags />,
            meta: {
              title: '账单标签',
              icon: <TagOutlined />
            }
          },
          {
            path: 'bill-imports',
            element: <BillImports />,
            meta: {
              title: '账单导入',
              icon: <FileTextOutlined />
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
