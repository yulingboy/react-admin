import React, { useState } from 'react';
import { Button, Card, Input, Table, Spin, Alert, Divider, Typography } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { executeSql } from '@/api/sql-executor';
import { message } from '@/hooks/useMessage';
import styles from './styles.module.css';

const { TextArea } = Input;
const { Title } = Typography;

const SqlExecutorPage: React.FC = () => {
  const [sql, setSql] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [affectedRows, setAffectedRows] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // 处理SQL语句变化
  const handleSqlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSql(e.target.value);
    // 清除之前的错误
    setError(null);
  };

  // 执行SQL语句
  const handleExecute = async () => {
    if (!sql.trim()) {
      setError('SQL语句不能为空');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setAffectedRows(null);
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const response = await executeSql(sql);
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
      
      // 判断响应是否包含查询结果集或影响的行数
      if (Array.isArray(response)) {
        // 查询操作，返回结果集
        setResult(response);
        
        // 如果有结果，生成表格列
        if (response.length > 0) {
          const firstRow = response[0];
          const tableColumns = Object.keys(firstRow).map(key => ({
            title: key,
            dataIndex: key,
            key: key,
            // 长文本使用省略号显示
            ellipsis: true,
            render: (text: any) => {
              // 处理不同类型的数据显示
              if (text === null) return <span className={styles.nullValue}>NULL</span>;
              if (typeof text === 'object') return JSON.stringify(text);
              return text.toString();
            }
          }));
          setColumns(tableColumns);
        } else {
          setColumns([]);
        }
      } else if (response.affectedRows !== undefined) {
        // DML操作，返回影响的行数
        setAffectedRows(response.affectedRows);
      }
    } catch (error: any) {
      console.error('执行SQL失败:', error);
      setError(error.response?.data?.message || '执行SQL失败');
    } finally {
      setLoading(false);
    }
  };

  // 结果展示部分
  const renderResult = () => {
    if (error) {
      return <Alert message="错误" description={error} type="error" showIcon />;
    }

    if (affectedRows !== null) {
      return (
        <Alert
          message="操作成功"
          description={`影响了 ${affectedRows} 行数据`}
          type="success"
          showIcon
        />
      );
    }

    if (result && result.length > 0) {
      return (
        <div className={styles.resultContainer}>
          <div className={styles.resultMeta}>
            查询返回 {result.length} 条记录
            {executionTime !== null && (
              <span className={styles.executionTime}>
                执行时间: {executionTime.toFixed(2)} ms
              </span>
            )}
          </div>
          <Table
            dataSource={result}
            columns={columns}
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            rowKey={(record, index) => index.toString()}
          />
        </div>
      );
    }

    if (result && result.length === 0) {
      return <Alert message="查询结果为空" type="info" showIcon />;
    }

    return null;
  };

  return (
    <div className={styles.sqlExecutorContainer}>
      <Card
        title={
          <div className={styles.cardTitle}>
            <DatabaseOutlined /> SQL执行器
          </div>
        }
        bordered={false}
      >
        <div className={styles.sqlInputSection}>
          <Title level={5}>输入SQL语句</Title>
          <TextArea
            value={sql}
            onChange={handleSqlChange}
            placeholder="请输入SQL语句，例如: SELECT * FROM users LIMIT 10"
            autoSize={{ minRows: 6, maxRows: 10 }}
            className={styles.sqlTextarea}
          />
          <div className={styles.actionBar}>
            <Button
              type="primary"
              onClick={handleExecute}
              loading={loading}
              icon={<DatabaseOutlined />}
            >
              执行
            </Button>
          </div>
        </div>

        <Divider orientation="left">执行结果</Divider>

        <Spin spinning={loading} tip="执行中...">
          <div className={styles.resultSection}>
            {renderResult()}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default SqlExecutorPage;