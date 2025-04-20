import React from 'react';
import { Table } from 'antd';
import { QueryResult } from '@/modules/tools/types/db-manager';

interface SqlResultTableProps {
  result: QueryResult;
}

const SqlResultTable: React.FC<SqlResultTableProps> = ({ result }) => {
  // 构建结果表列
  const getResultColumns = () => {
    if (!result.fields) return [];

    return result.fields.map(field => ({
      title: field.name,
      dataIndex: field.name,
      key: field.name,
      ellipsis: true,
      render: (text: any) => {
        if (text === null) return <span className="text-gray-400">NULL</span>;
        if (typeof text === 'object') return JSON.stringify(text);
        return String(text);
      }
    }));
  };

  return (
    <Table
      columns={getResultColumns()}
      dataSource={result.rows}
      rowKey={(_, index) => index!.toString()}
      pagination={{
        pageSize: 10,
        showSizeChanger: true
      }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default SqlResultTable;
