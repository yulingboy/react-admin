import React from 'react';
import { Space, Tag, Switch } from 'antd';
import { AccountType } from '@/modules/finance/types';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 操作列属性
 */
interface OperationColumnProps {
  handleEditAccountType: (record: AccountType) => void;
  handleDeleteAccountType: (id: number) => void;
}

/**
 * 获取账户类型表格列配置
 * @param props 操作列属性
 * @returns 列配置
 */
export const getAccountTypeColumns = (props: OperationColumnProps): ProColumns<AccountType>[] => {
  const { handleEditAccountType, handleDeleteAccountType } = props;

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      search: false,
      render: (_, record) => (record.icon ? <span className="flex items-center"><i className={record.icon} /></span> : '-'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        '0': { text: '禁用', status: 'Error' },
        '1': { text: '启用', status: 'Success' },
      },
      render: (_, record) => (
        <Tag color={record.status === '1' ? 'success' : 'error'}>
          {record.status === '1' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      width: 120,
      valueEnum: {
        '0': { text: '否' },
        '1': { text: '是' },
      },
      render: (_, record) => (
        <Tag color={record.isSystem === '1' ? 'blue' : 'default'}>
          {record.isSystem === '1' ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => handleEditAccountType(record)}
          title="编辑"
          className="text-blue-500"
          disabled={record.isSystem === '1'}
        >
          <EditOutlined />
        </a>,
        <a
          key="delete"
          onClick={() => handleDeleteAccountType(record.id)}
          title="删除"
          className="text-red-500"
          disabled={record.isSystem === '1'}
        >
          <DeleteOutlined />
        </a>,
      ],
    },
  ];
};