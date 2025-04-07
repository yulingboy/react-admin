import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6">
        <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">页面找不到了</h1>
        <p className="text-gray-600 mb-8">您访问的页面不存在，可能是链接已过期或输入了错误的URL</p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full sm:w-auto sm:inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full sm:w-auto sm:inline-block sm:ml-3 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors mt-3 sm:mt-0"
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
