import React, { useState, useRef } from 'react';
import { Divider, message } from 'antd';
import { executeSql } from '@/api/db-manager';
import { QueryResult } from '@/types/db-manager';
import { SqlInputRef } from '@/components/sql-input';
import SqlQueryInput from './sql-query-input';
import SqlResultError from './sql-result-error';
import SqlResultInfo from './sql-result-info';
import SqlResultTable from './sql-result-table';
import EmptyResult from './empty-result';

interface SqlEditorProps {
  connectionId: number;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ connectionId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sqlInputRef = useRef<SqlInputRef>(null);

  // 执行SQL
  const handleExecuteSql = async (sqlText: string) => {
    if (!connectionId) return;

    if (!sqlText.trim()) {
      setError('SQL语句不能为空');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await executeSql(connectionId, sqlText);
      setResult(result);
      message.success('SQL执行成功');
    } catch (error: any) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 保存SQL
  const handleSaveSql = (sqlText: string) => {
    // 这里可以实现保存SQL到历史记录或收藏的功能
    message.info('保存功能暂未实现');
  };

  return (
    <div className="w-full">
      <SqlQueryInput ref={sqlInputRef} loading={loading} onExecute={handleExecuteSql} onSave={handleSaveSql} />

      <Divider className="my-4">查询结果</Divider>

      {error && <SqlResultError error={error} />}

      {result && (
        <>
          <SqlResultInfo executionTime={result.executionTime} rowCount={result.rowCount} />
          <SqlResultTable result={result} />
        </>
      )}

      {!result && !error && !loading && <EmptyResult />}
    </div>
  );
};

export default SqlEditor;
