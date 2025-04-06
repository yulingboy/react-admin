import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterComponent: React.FC = () => {
  return (
    <Footer className="h-12 bg-white border-t flex items-center justify-center text-sm text-gray-500 p-0">
      <p className="m-0">© {new Date().getFullYear()} React Admin - 基于 React + Ant Design + Tailwind CSS</p>
    </Footer>
  );
};

export default FooterComponent;
