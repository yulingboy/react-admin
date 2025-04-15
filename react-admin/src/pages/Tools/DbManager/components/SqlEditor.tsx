import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Space, Alert, Divider, Typography } from 'antd';
import { PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { editor } from 'monaco-editor'; // 直接引入editor模块
import { executeSql } from '@/api/db-manager';
import { QueryResult } from '@/types/db-manager';

const { Text } = Typography;

interface SqlEditorProps {
  connectionId: number;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ connectionId }) => {
  const [sql, setSql] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化编辑器
  useEffect(() => {
    // 确保只创建一次编辑器
    if (containerRef.current && !editorRef.current) {
      try {
        // 创建编辑器实例
        const editorInstance = editor.create(containerRef.current, {
          value: sql,
          language: 'sql',
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          folding: true,
          fontSize: 14,
          theme: 'vs',
        });

        // 设置编辑器引用
        editorRef.current = editorInstance;

        // 监听编辑器内容变化
        editorInstance.onDidChangeModelContent(() => {
          const value = editorInstance.getValue();
          setSql(value);
        });

        // 确保编辑器及时更新布局
        const resizeObserver = new ResizeObserver(() => {
          if (editorRef.current) {
            editorRef.current.layout();
          }
        });

        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }

        // 组件卸载时清理资源
        return () => {
          if (editorRef.current) {
            editorRef.current.dispose();
          }
          resizeObserver.disconnect();
        };
      } catch (err) {
        console.error('Monaco editor initialization failed:', err);
      }
    }
  }, []);

  // 执行SQL
  const handleExecuteSql = async () => {
    if (!connectionId || !editorRef.current) return;
    
    const sqlText = editorRef.current.getValue();
    if (!sqlText.trim()) {
      setError('SQL语句不能为空');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await executeSql(connectionId, sqlText);
      setResult(result);
    } catch (error: any) {
      setError(error.message || '执行SQL失败');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 保存SQL
  const handleSaveSql = () => {
    // 这里可以实现保存SQL到历史记录或收藏的功能
    // 暂不实现
  };

  // 构建结果表列
  const getResultColumns = () => {
    if (!result || !result.fields) return [];
    
    return result.fields.map(field => ({
      title: field.name,
      dataIndex: field.name,
      key: field.name,
      ellipsis: true,
      render: (text: any) => {
        if (text === null) return <span style={{ color: '#999999' }}>NULL</span>;
        if (typeof text === 'object') return JSON.stringify(text);
        return String(text);
      }
    }));
  };

  return (
    <div className="sql-editor-container">
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={loading}
            onClick={handleExecuteSql}
          >
            执行
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveSql}
          >
            保存
          </Button>
        </Space>
      </div>
      
      <Card bodyStyle={{ padding: 0 }}>
        <div
          ref={containerRef}
          style={{ 
            height: 200, 
            width: '100%', 
            border: '1px solid #d9d9d9',
            overflow: 'hidden'
          }}
        />
      </Card>
      
      <Divider style={{ margin: '16px 0' }}>查询结果</Divider>
      
      {error && (
        <Alert
          type="error"
          message="执行出错"
          description={error}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {result && (
        <>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">
              执行完成，用时 {result.executionTime}ms，返回 {result.rowCount} 条记录
            </Text>
          </div>
          
          <Table
            columns={getResultColumns()}
            dataSource={result.rows}
            rowKey={(_, index) => index.toString()}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </>
      )}
      
      {!result && !error && !loading && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
          请编写SQL语句并点击执行按钮
        </div>
      )}
    </div>
  );
};

export default SqlEditor;