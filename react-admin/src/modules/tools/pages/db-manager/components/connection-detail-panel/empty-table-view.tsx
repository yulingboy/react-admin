import React from 'react';
import { Card, Button } from 'antd';

interface EmptyTableViewProps {
  onRefresh: () => void;
  loading: boolean;
}

const EmptyTableView: React.FC<EmptyTableViewProps> = ({ onRefresh, loading }) => {
  return (
    <Card className="shadow-sm">
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">请从左侧选择一个表</p>
        <Button type="primary" onClick={onRefresh} loading={loading}>
          刷新表列表
        </Button>
      </div>
    </Card>
  );
};

export default EmptyTableView;
