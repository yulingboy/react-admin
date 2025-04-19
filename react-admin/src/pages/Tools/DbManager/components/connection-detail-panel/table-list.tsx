import React, { useState } from 'react';
import { Tree, Input, Spin } from 'antd';
import { DatabaseOutlined, TableOutlined, SearchOutlined } from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { DatabaseTable } from '@/types/db-manager';

const { Search } = Input;

interface TableListProps {
  tables: DatabaseTable[];
  loading: boolean;
  database?: string;
  onTableSelect: (tableName: string) => void;
}

const TableList: React.FC<TableListProps> = ({ tables, loading, database, onTableSelect }) => {
  const [filter, setFilter] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // 构建树数据
  const getTreeData = (): TreeDataNode[] => {
    const filteredTables = filter ? tables.filter(table => table.name.toLowerCase().includes(filter.toLowerCase())) : tables;

    return [
      {
        title: database || '数据库',
        key: 'root',
        icon: <DatabaseOutlined />,
        children: filteredTables.map(table => ({
          title: table.name,
          key: table.name,
          icon: <TableOutlined />,
          isLeaf: true
        }))
      }
    ];
  };

  return (
    <div className="w-60 border-r border-gray-200 mr-4 h-full overflow-auto">
      <Search placeholder="搜索表" allowClear onChange={e => setFilter(e.target.value)} className="mb-2" prefix={<SearchOutlined />} />
      <Spin spinning={loading}>
        {tables.length > 0 ? (
          <Tree
            treeData={getTreeData()}
            defaultExpandAll
            selectedKeys={selectedKeys}
            onSelect={(keys, info) => {
              if (info.node.isLeaf) {
                const key = info.node.key as string;
                setSelectedKeys([key]);
                onTableSelect(key);
              }
            }}
          />
        ) : (
          <div className="p-4 text-gray-500 text-center">{loading ? '加载中...' : '暂无数据表'}</div>
        )}
      </Spin>
    </div>
  );
};

export default TableList;
