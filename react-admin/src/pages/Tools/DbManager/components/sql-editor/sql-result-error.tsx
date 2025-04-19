import React from 'react';
import { Alert } from 'antd';

interface SqlResultErrorProps {
  error: string;
}

const SqlResultError: React.FC<SqlResultErrorProps> = ({ error }) => {
  return <Alert type="error" message="执行出错" description={error} showIcon className="mb-4" />;
};

export default SqlResultError;
