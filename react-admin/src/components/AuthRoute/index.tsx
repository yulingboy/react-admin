import useMessage from '@/hooks/useMessage';
import { local, STORAGE_KEYS } from '@/utils/storage';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const location = useLocation();
  useMessage();

  // 检查是否有token
  const token = local.get(STORAGE_KEYS.TOKEN);

  if (!token && location.pathname !== '/login') {
    // 如果没有token，重定向到登录页
    // 保存当前位置，以便登录成功后可以返回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果有token，渲染子组件
  return <>{children}</>;
};

export default AuthRoute;
