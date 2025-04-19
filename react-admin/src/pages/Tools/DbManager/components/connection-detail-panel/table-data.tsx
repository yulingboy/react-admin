import React from 'react';
import { Table } from 'antd';

interface TableDataProps {
  columns: any[];
  dataSource: any[];
  loading: boolean;
}

const TableData: React.FC<TableDataProps> = ({ columns, dataSource, loading }) => {
  return (
    <Table
      className="!w-full"
      columns={columns}
      dataSource={dataSource}
      rowKey={(record, index) => index!.toString()}
      size="small"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true
      }}
      loading={loading}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default TableData;
