import React from 'react';
import { Button, Popconfirm, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { DatabaseConnection, DatabaseType } from '@/modules/tools/types/db-manager';
import useDictionary from '@/hooks/useDictionaryBack';

// 数据库类型标签颜色映射
const databaseTypeColors = {
  [DatabaseType.MYSQL]: 'blue',
  [DatabaseType.POSTGRES]: 'green',
  [DatabaseType.MSSQL]: 'purple',
  [DatabaseType.MARIADB]: 'cyan',
  [DatabaseType.SQLITE]: 'orange'
};

interface ConnectionColumnsProps {
  handleEditConnection: (record: DatabaseConnection) => void;
  handleDeleteConnection: (id: number) => void;
  handleConnect: (record: DatabaseConnection) => void;
}

const getConnectionColumns = ({ handleEditConnection, handleDeleteConnection, handleConnect }: ConnectionColumnsProps): ProColumns<DatabaseConnection>[] => {
  // 使用改进的 hook，获取字典数据
  const { valueEnum: statusEnum, labelMap: statusLabelMap } = useDictionary('sys_common_status');
  const { valueEnum: isSystemEnum, labelMap: isSystemLabelMap } = useDictionary('sys_is_system');
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false
    },
    {
      title: '连接名称',
      dataIndex: 'name',
      ellipsis: true
    },
    {
      title: '数据库类型',
      dataIndex: 'type',
      valueEnum: {
        [DatabaseType.MYSQL]: { text: 'MySQL' },
        [DatabaseType.POSTGRES]: { text: 'PostgreSQL' },
        [DatabaseType.MSSQL]: { text: 'SQL Server' },
        [DatabaseType.MARIADB]: { text: 'MariaDB' },
        [DatabaseType.SQLITE]: { text: 'SQLite' }
      },
      render: (_, record) => (
        <Tag color={databaseTypeColors[record.type]}>
          {record.type === DatabaseType.MYSQL
            ? 'MySQL'
            : record.type === DatabaseType.POSTGRES
              ? 'PostgreSQL'
              : record.type === DatabaseType.MSSQL
                ? 'SQL Server'
                : record.type === DatabaseType.MARIADB
                  ? 'MariaDB'
                  : 'SQLite'}
        </Tag>
      )
    },
    {
      title: '主机',
      dataIndex: 'host',
      search: false,
      render: (text, record) => (record.type === DatabaseType.SQLITE ? record.filename : text)
    },
    {
      title: '数据库名',
      dataIndex: 'database',
      search: false
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: statusEnum,
      render: (_, record) => {
        const status = record.status;
        const label = statusLabelMap[status].label || '未知状态';
        const color = statusLabelMap[status].color || 'success';

        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      align: 'center',
      valueType: 'select',
      valueEnum: isSystemEnum,
      render: (_, record) => {
        const isSystem = record.isSystem;
        const label = isSystemLabelMap[isSystem].label || '未知状态';
        const color = isSystemLabelMap[isSystem].color || 'success';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button key="connect" type="link" onClick={() => handleConnect(record)} disabled={record.status === '0'}>
          连接
        </Button>,
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEditConnection(record)}>
          编辑
        </Button>,
        record.isSystem === '1' ? (
          <Button key="delete" type="link" danger disabled icon={<DeleteOutlined />}>
            删除
          </Button>
        ) : (
          <Popconfirm key="delete" title="确定要删除此连接吗？" onConfirm={() => handleDeleteConnection(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        )
      ]
    }
  ];
};

export default getConnectionColumns;
