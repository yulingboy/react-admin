import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { local, STORAGE_KEYS } from '@/utils/storage';
import { UserInfo } from '@/api/auth';
import { message } from '@/hooks/useMessage';

const UserInfoDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 修复: 将用户信息获取逻辑放在useEffect中并确保它只运行一次
  useEffect(() => {
    const user = local.get<UserInfo>(STORAGE_KEYS.USER_INFO);
    if (user) {
      setUserInfo(user);
    }
  }, []);

  const handleLogout = () => {
    // 使用新的存储工具清除登录信息
    local.remove(STORAGE_KEYS.TOKEN);
    local.remove(STORAGE_KEYS.USER_INFO);

    message.success('退出登录成功');
    navigate('/login');
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        账号设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  if (!userInfo) {
    return null;
  }

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <div className="flex items-center cursor-pointer px-4 hover:bg-gray-100 py-2 rounded transition-colors">
        <Avatar src={userInfo.avatar} size="small" className="mr-2" icon={!userInfo.avatar && <UserOutlined />} />
        <span className="ml-2 text-sm">{userInfo.name || userInfo.username}</span>
      </div>
    </Dropdown>
  );
};

export default UserInfoDropdown;
