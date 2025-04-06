import React, { useState } from 'react';
import { Card, Button, Tag, Space, Typography, Checkbox, Divider, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  users: number;
  createTime: string;
}

const RoleManage: React.FC = () => {
  const [roles] = useState<Role[]>([
    {
      id: 1,
      name: '超级管理员',
      description: '系统最高权限，可以访问所有功能',
      permissions: ['all'],
      users: 2,
      createTime: '2023-01-15'
    },
    {
      id: 2,
      name: '管理员',
      description: '系统管理权限，可以管理大部分功能',
      permissions: ['user:manage', 'role:view', 'content:manage'],
      users: 5,
      createTime: '2023-01-16'
    },
    {
      id: 3,
      name: '编辑',
      description: '内容编辑人员，负责内容管理',
      permissions: ['content:manage', 'content:publish'],
      users: 8,
      createTime: '2023-02-20'
    },
    {
      id: 4,
      name: '用户',
      description: '普通用户，有基本的访问权限',
      permissions: ['content:view'],
      users: 24,
      createTime: '2023-03-10'
    }
  ]);

  const getPermissionColor = (permission: string) => {
    if (permission === 'all') return 'red';
    if (permission.startsWith('user:')) return 'blue';
    if (permission.startsWith('role:')) return 'purple';
    if (permission.startsWith('content:')) return 'green';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="!mb-0">
          <TeamOutlined className="mr-2" />
          角色管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />}>
          添加角色
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {roles.map(role => (
          <Col key={role.id} xs={24} sm={12} lg={6}>
            <Card
              hoverable
              className="h-full"
              actions={[
                <Button type="text" icon={<EditOutlined />}>
                  编辑
                </Button>,
                <Popconfirm title="确定要删除此角色吗？" okText="确定" cancelText="取消">
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              ]}
              extra={<Tag color="blue">{role.users} 用户</Tag>}
            >
              <div>
                <Typography.Title level={5} className="!mb-1">
                  {role.name}
                </Typography.Title>
                <Typography.Paragraph type="secondary" className="mb-3 text-sm h-10 line-clamp-2">
                  {role.description}
                </Typography.Paragraph>

                <div className="mb-3">
                  <Space size={[0, 4]} wrap>
                    {role.permissions.map((permission, index) => (
                      <Tag color={getPermissionColor(permission)} key={index}>
                        {permission}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <Divider className="my-2" />
                <div className="text-xs text-gray-500">创建于 {role.createTime}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <div className="flex items-center">
            <SettingOutlined className="mr-2" />
            <span>权限列表</span>
          </div>
        }
        className="shadow-sm"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="用户管理" size="small" bordered>
              <Checkbox.Group className="flex flex-col space-y-2">
                <Checkbox value="user:view">查看用户</Checkbox>
                <Checkbox value="user:create">创建用户</Checkbox>
                <Checkbox value="user:edit">编辑用户</Checkbox>
                <Checkbox value="user:delete">删除用户</Checkbox>
              </Checkbox.Group>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="角色管理" size="small" bordered>
              <Checkbox.Group className="flex flex-col space-y-2">
                <Checkbox value="role:view">查看角色</Checkbox>
                <Checkbox value="role:create">创建角色</Checkbox>
                <Checkbox value="role:edit">编辑角色</Checkbox>
                <Checkbox value="role:delete">删除角色</Checkbox>
              </Checkbox.Group>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="内容管理" size="small" bordered>
              <Checkbox.Group className="flex flex-col space-y-2">
                <Checkbox value="content:view">查看内容</Checkbox>
                <Checkbox value="content:create">创建内容</Checkbox>
                <Checkbox value="content:edit">编辑内容</Checkbox>
                <Checkbox value="content:publish">发布内容</Checkbox>
              </Checkbox.Group>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RoleManage;
