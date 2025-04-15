import React from 'react';
import { Button, Popconfirm, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { DatabaseConnection, DatabaseType } from '@/types/db-manager';
import DictionaryTag from '@/components/Dictionary/DictionaryTag';

// 数据库类型标签颜色映射
const databaseTypeColors = {
  [DatabaseType.MYSQL]: 'blue',
  [DatabaseType.POSTGRES]: 'green',
  [DatabaseType.MSSQL]: 'purple',
  [DatabaseType.MARIADB]: 'cyan',
  [DatabaseType.SQLITE]: 'orange',
};

interface ConnectionColumnsProps {
  handleEditConnection: (record: DatabaseConnection) => void;
  handleDeleteConnection: (id: number) => void;
  handleConnect: (record: DatabaseConnection) => void;
}

export const getConnectionColumns = ({
  handleEditConnection,
  handleDeleteConnection,
  handleConnect,
}: ConnectionColumnsProps): ProColumns<DatabaseConnection>[] => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 60,
    search: false,
  },
  {
    title: '连接名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '数据库类型',
    dataIndex: 'type',
    valueEnum: {
      [DatabaseType.MYSQL]: { text: 'MySQL' },
      [DatabaseType.POSTGRES]: { text: 'PostgreSQL' },
      [DatabaseType.MSSQL]: { text: 'SQL Server' },
      [DatabaseType.MARIADB]: { text: 'MariaDB' },
      [DatabaseType.SQLITE]: { text: 'SQLite' },
    },
    render: (_, record) => (
      <Tag color={databaseTypeColors[record.type]}>
        {record.type === DatabaseType.MYSQL ? 'MySQL' :
         record.type === DatabaseType.POSTGRES ? 'PostgreSQL' :
         record.type === DatabaseType.MSSQL ? 'SQL Server' :
         record.type === DatabaseType.MARIADB ? 'MariaDB' : 'SQLite'}
      </Tag>
    ),
  },
  {
    title: '主机',
    dataIndex: 'host',
    search: false,
    render: (text, record) => (
      record.type === DatabaseType.SQLITE ? record.filename : text
    ),
  },
  {
    title: '数据库名',
    dataIndex: 'database',
    search: false,
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      '0': { text: '禁用', status: 'Error' },
      '1': { text: '启用', status: 'Success' },
    },
    render: (_, record) => (
      <DictionaryTag 
        code="sys_normal_disable" 
        value={record.status} 
      />
    ),
  },
  {
    title: '系统内置',
    dataIndex: 'isSystem',
    search: false,
    render: (_, record) => (
      <DictionaryTag 
        code="sys_yes_no" 
        value={record.isSystem} 
      />
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    search: false,
  },
  {
    title: '操作',
    valueType: 'option',
    width: 200,
    render: (_, record) => [
      <Button
        key="connect"
        type="link"
        onClick={() => handleConnect(record)}
        disabled={record.status === '0'}
      >
        连接
      </Button>,
      <Button 
        key="edit" 
        type="link" 
        icon={<EditOutlined />}
        onClick={() => handleEditConnection(record)}
      >
        编辑
      </Button>,
      record.isSystem === '1' ? (
        <Button 
          key="delete" 
          type="link" 
          danger 
          disabled
          icon={<DeleteOutlined />}
        >
          删除
        </Button>
      ) : (
        <Popconfirm
          key="delete"
          title="确定要删除此连接吗？"
          onConfirm={() => handleDeleteConnection(record.id)}
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
      ),
    ],
  },
];