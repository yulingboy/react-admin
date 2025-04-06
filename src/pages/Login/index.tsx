import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { message } from '@/hooks/useMessage';

const { Title, Text, Paragraph } = Typography;

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取用户之前尝试访问的页面
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (values: LoginFormData) => {
    if (!values.username || !values.password) {
      message.error('请输入用户名和密码');
      return;
    }

    setLoading(true);

    // 模拟登录请求
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 假设登录成功，存储token到localStorage
      localStorage.setItem('token', 'demo-token-abc123');

      message.success('登录成功，欢迎回来！');

      // 导航回用户之前尝试访问的页面
      navigate(from);
    } catch (error) {
      console.error('登录失败', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card bordered={false} className="shadow-2xl rounded-lg overflow-hidden backdrop-blur-sm bg-white/90" bodyStyle={{ padding: '30px' }}>
          <div className="text-center mb-6">
            <div className="inline-block p-4 rounded-full bg-blue-100 mb-4">
              <UserOutlined className="text-3xl text-blue-600" />
            </div>
            <Title level={2} className="!mb-1">
              欢迎登录
            </Title>
            <Paragraph className="text-gray-500">请输入您的账号和密码</Paragraph>
          </div>

          <Form form={form} layout="vertical" name="login" initialValues={{ remember: true }} onFinish={handleSubmit} size="large">
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="用户名" autoComplete="username" className="rounded-md" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
              <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="密码" autoComplete="current-password" className="rounded-md" />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a className="text-blue-600 hover:text-blue-800" href="#">
                忘记密码?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="!mb-4">
            <span className="text-gray-400 text-sm">演示账户</span>
          </Divider>
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <Text className="text-gray-500">账号: admin / 密码: admin123</Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
