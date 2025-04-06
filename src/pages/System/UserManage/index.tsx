import React, { useState } from 'react';
import { Table, Button, Input, Select, Badge, Space, Card, Popconfirm, Tag, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
}

const UserManage: React.FC = () => {
  const [users] = useState<User[]>([
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: 'active', lastLogin: '2023-05-15 09:23' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: 'active', lastLogin: '2023-05-14 15:45' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: '用户', status: 'inactive', lastLogin: '2023-05-10 11:30' },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '访客', status: 'locked', lastLogin: '2023-05-05 08:15' },
    { id: 5, name: '钱七', email: 'qianqi@example.com', role: '用户', status: 'active', lastLogin: '2023-05-15 14:20' }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge status="success" text="活跃" />;
      case 'inactive':
        return <Badge status="default" text="非活跃" />;
      case 'locked':
        return <Badge status="error" text="已锁定" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      render: text => <span className="font-medium">{text}</span>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: role => <Tag color="blue">{role}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusBadge(status)
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Popconfirm title="确定要删除此用户吗？" okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card bordered={false} className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Typography.Title level={4} className="!mb-0">
            <UserOutlined className="mr-2" />
            用户管理
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />}>
            添加用户
          </Button>
        </div>

        <div className="bg-white mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Input.Search placeholder="搜索用户..." allowClear className="w-72" prefix={<SearchOutlined />} />
            <Space>
              <Select
                placeholder="所有角色"
                style={{ width: 120 }}
                options={[
                  { value: '', label: '所有角色' },
                  { value: 'admin', label: '管理员' },
                  { value: 'editor', label: '编辑' },
                  { value: 'user', label: '用户' },
                  { value: 'guest', label: '访客' }
                ]}
              />
              <Select
                placeholder="所有状态"
                style={{ width: 120 }}
                options={[
                  { value: '', label: '所有状态' },
                  { value: 'active', label: '活跃' },
                  { value: 'inactive', label: '非活跃' },
                  { value: 'locked', label: '已锁定' }
                ]}
              />
            </Space>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            total: 12,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条记录`
          }}
          className="ant-table-striped"
        />
      </Card>
    </div>
  );
};

export default UserManage;
