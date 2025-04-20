import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface SqlResultInfoProps {
  executionTime: number;
  rowCount: number;
}

const SqlResultInfo: React.FC<SqlResultInfoProps> = ({ executionTime, rowCount }) => {
  return (
    <div className="mb-2">
      <Text type="secondary">
        执行完成，用时 {executionTime}ms，返回 {rowCount} 条记录
      </Text>
    </div>
  );
};

export default SqlResultInfo;
