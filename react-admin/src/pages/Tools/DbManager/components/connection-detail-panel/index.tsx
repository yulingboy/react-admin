import React, { useState, useEffect, JSX } from 'react';
import { Drawer, Tabs, Button, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { DatabaseColumn, DatabaseConnection, DatabaseTable } from '@/types/db-manager';
import { getDatabaseTables, getTableStructure, getTableData } from '@/api/db-manager';
import SqlEditor from '../sql-editor';
import TableList from './table-list';
import TableStructure from './table-structure';
import TableData from './table-data';
import EmptyTableView from './empty-table-view';

const { TabPane } = Tabs;

interface ConnectionDetailPanelProps {
  visible: boolean;
  connection: DatabaseConnection | null;
  onClose: () => void;
}

const ConnectionDetailPanel: React.FC<ConnectionDetailPanelProps> = ({ visible, connection, onClose }) => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [tableStructure, setTableStructure] = useState<DatabaseColumn[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<
    { title: string; dataIndex: string; key: string; ellipsis: boolean; render: (text: any) => string | JSX.Element }[]
  >([]);

  // 加载数据库表
  const loadTables = async () => {
    if (!connection?.id) return;

    try {
      setLoading(true);
      const result = await getDatabaseTables(connection.id);
      setTables(result);
    } finally {
      setLoading(false);
    }
  };

  // 加载表结构
  const loadTableStructure = async (tableName: string) => {
    if (!connection?.id) return;

    try {
      setLoading(true);
      const result = await getTableStructure(connection.id, tableName);
      setTableStructure(result);
    } finally {
      setLoading(false);
    }
  };

  // 加载表数据
  const loadTableData = async (tableName: string) => {
    if (!connection?.id) return;

    try {
      setLoading(true);
      const result = await getTableData(connection.id, tableName, { page: 1, pageSize: 100 });

      // 设置列
      const columns = result.fields.map(field => ({
        title: field.name,
        dataIndex: field.name,
        key: field.name,
        ellipsis: true,
        render: (text: null) => {
          if (text === null) return <span className="text-gray-400">NULL</span>;
          if (typeof text === 'object') return JSON.stringify(text);
          return String(text);
        }
      }));

      setTableColumns(columns);
      setTableData(result.rows);
    } finally {
      setLoading(false);
    }
  };

  // 当连接变化时加载表
  useEffect(() => {
    if (visible && connection) {
      loadTables();
    }
  }, [connection, visible]);

  // 处理表选择
  const handleTableSelect = (tableName: string | null) => {
    setActiveTable(tableName);
    if (tableName) {
      loadTableStructure(tableName);
    }
    if (tableName) {
      loadTableData(tableName);
    }
  };

  return (
    <Drawer
      title={`${connection?.name || '数据库连接'} [${connection?.type}] - ${connection?.database || ''}`}
      placement="right"
      width="80%"
      onClose={onClose}
      open={visible}
      destroyOnClose
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadTables}>
            刷新
          </Button>
        </Space>
      }
    >
      <div className="flex h-[calc(100vh-130px)]">
        <TableList tables={tables} loading={loading} database={connection?.database} onTableSelect={handleTableSelect} />

        <div className="flex-1 overflow-x-auto">
          {activeTable ? (
            <Tabs defaultActiveKey="structure" className="!w-full">
              <TabPane tab="表结构" key="structure">
                <TableStructure columns={tableStructure} loading={loading} />
              </TabPane>
              <TabPane tab="表数据" key="data">
                <TableData columns={tableColumns} dataSource={tableData} loading={loading} />
              </TabPane>
              <TabPane tab="SQL查询" key="sql">
                <SqlEditor connectionId={connection?.id || 0} />
              </TabPane>
            </Tabs>
          ) : (
            <EmptyTableView onRefresh={loadTables} loading={loading} />
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ConnectionDetailPanel;
