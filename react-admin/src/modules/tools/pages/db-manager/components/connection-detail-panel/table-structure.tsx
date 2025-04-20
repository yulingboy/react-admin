import React from 'react';
import { Table } from 'antd';
import { DatabaseColumn } from '@/modules/tools/types/db-manager';

interface TableStructureProps {
  columns: DatabaseColumn[];
  loading: boolean;
}

const TableStructure: React.FC<TableStructureProps> = ({ columns, loading }) => {
  // 表结构列定义
  const structureColumns = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '可为空',
      dataIndex: 'nullable',
      key: 'nullable',
      render: (nullable: boolean) => (nullable ? '是' : '否')
    },
    {
      title: '默认值',
      dataIndex: 'default',
      key: 'default',
      render: (text: any) => {
        if (text === undefined || text === null) return <span className="text-gray-400">NULL</span>;
        return String(text);
      }
    },
    {
      title: '主键',
      dataIndex: 'isPrimary',
      key: 'isPrimary',
      render: (isPrimary: boolean) => (isPrimary ? '是' : '否')
    },
    {
      title: '唯一',
      dataIndex: 'isUnique',
      key: 'isUnique',
      render: (isUnique: boolean) => (isUnique ? '是' : '否')
    },
    {
      title: '索引',
      dataIndex: 'isIndex',
      key: 'isIndex',
      render: (isIndex: boolean) => (isIndex ? '是' : '否')
    },
    {
      title: '外键',
      dataIndex: 'isForeign',
      key: 'isForeign',
      render: (isForeign: boolean) => (isForeign ? '是' : '否')
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    }
  ];

  return (
    <Table columns={structureColumns} dataSource={columns} rowKey="name" size="small" pagination={false} loading={loading} scroll={{ x: 'max-content' }} />
  );
};

export default TableStructure;
