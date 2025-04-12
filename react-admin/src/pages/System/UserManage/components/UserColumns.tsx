import React from 'react';
import { Button, Tag, Popconfirm, Avatar, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { User } from '@/types/user';
import { createDictionaryRenderer, useDictionaryEnum } from '@/utils/dictionaryHelper';

interface UserColumnsProps {
  handleEditUser: (record: User) => void;
  handleDeleteUser: (id: number) => void;
}

export const getUserColumns = ({ handleEditUser, handleDeleteUser }: UserColumnsProps): ProColumns<User>[] => {
  // 使用字典数据hook获取枚举值
  const userStatusEnum = useDictionaryEnum('sys_common_status');
  const isSystemEnum = useDictionaryEnum('sys_is_system');

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
    },
    {
      title: '用户头像',
      dataIndex: 'avatar',
      search: false,
      render: (_, record) => (
        <Avatar
          size="small"
          src={record.avatar}
          icon={<UserOutlined />}
        />
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: userStatusEnum,
      render: (_, record) => createDictionaryRenderer('sys_common_status', record.status)
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      render: (_, record) => (
        <Tag color="blue">{record.roleName}</Tag>
      ),
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      valueType: 'select',
      valueEnum: isSystemEnum,
      render: (_, record) => createDictionaryRenderer('sys_is_system', record.isSystem)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <Button 
          key="edit" 
          type="link" 
          icon={<EditOutlined />}
          onClick={() => handleEditUser(record)}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除此用户吗？"
          onConfirm={() => handleDeleteUser(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>
      ],
    },
  ];
};