import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import Sidebar from './components/Sidebar';
import HeaderComponent from './components/HeaderComponent';
import FooterComponent from './components/FooterComponent';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#ffffff'
        }
      }}
    >
      <Layout className="h-screen">
        {/* 侧边栏 */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <Layout style={{ backgroundColor: '#f5f5f5' }}>
          {/* 头部 */}
          <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

          {/* 内容区 */}
          <Content className="p-6 bg-gray-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm min-h-[calc(100vh-12rem)]">
              <Outlet />
            </div>

            {/* 页面加载反馈区域，可以在这里添加页面切换的加载状态 */}
            <div id="page-loading-indicator" className="hidden"></div>
          </Content>

          {/* 页脚 */}
          <FooterComponent />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
