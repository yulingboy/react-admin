import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Table, Card, Button, Space, message, Tree, Input, Spin } from 'antd';
import { DatabaseOutlined, TableOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { DatabaseConnection, DatabaseTable, DatabaseColumn } from '@/types/db-manager';
import { getDatabaseTables, getTableStructure, getTableData } from '@/api/db-manager';
import SqlEditor from './SqlEditor';

const { TabPane } = Tabs;
const { Search } = Input;

interface ConnectionDetailPanelProps {
  visible: boolean;
  connection: DatabaseConnection | null;
  onClose: () => void;
}

const ConnectionDetailPanel: React.FC<ConnectionDetailPanelProps> = ({
  visible,
  connection,
  onClose,
}) => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [tableStructure, setTableStructure] = useState<DatabaseColumn[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // 加载数据库表
  const loadTables = async () => {
    if (!connection?.id) return;
    
    try {
      setLoading(true);
      const result = await getDatabaseTables(connection.id);
      setTables(result);
    } catch (error) {
      console.error('获取数据库表失败:', error);
      message.error('获取数据库表列表失败');
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
    } catch (error) {
      console.error('获取表结构失败:', error);
      message.error('获取表结构失败');
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
        render: (text: any) => {
          if (text === null) return <span style={{ color: '#999999' }}>NULL</span>;
          if (typeof text === 'object') return JSON.stringify(text);
          return String(text);
        }
      }));
      
      setTableColumns(columns);
      setTableData(result.rows);
    } catch (error) {
      console.error('获取表数据失败:', error);
      message.error('获取表数据失败');
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
  const handleTableSelect = (tableName: string) => {
    setActiveTable(tableName);
    loadTableStructure(tableName);
    loadTableData(tableName);
    setSelectedKeys([tableName]);
  };

  // 构建树数据
  const getTreeData = (): TreeDataNode[] => {
    const filteredTables = filter 
      ? tables.filter(table => table.name.toLowerCase().includes(filter.toLowerCase()))
      : tables;
    
    return [
      {
        title: connection?.database || '数据库',
        key: 'root',
        icon: <DatabaseOutlined />,
        children: filteredTables.map(table => ({
          title: table.name,
          key: table.name,
          icon: <TableOutlined />,
          isLeaf: true,
        })),
      },
    ];
  };

  // 表结构列
  const structureColumns = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '可为空',
      dataIndex: 'nullable',
      key: 'nullable',
      width: 80,
      render: (nullable: boolean) => nullable ? '是' : '否',
    },
    {
      title: '默认值',
      dataIndex: 'default',
      key: 'default',
      width: 100,
      render: (text: any) => {
        if (text === undefined || text === null) return <span style={{ color: '#999999' }}>NULL</span>;
        return String(text);
      }
    },
    {
      title: '主键',
      dataIndex: 'isPrimary',
      key: 'isPrimary',
      width: 60,
      render: (isPrimary: boolean) => isPrimary ? '是' : '否',
    },
    {
      title: '唯一',
      dataIndex: 'isUnique',
      key: 'isUnique',
      width: 60,
      render: (isUnique: boolean) => isUnique ? '是' : '否',
    },
    {
      title: '索引',
      dataIndex: 'isIndex',
      key: 'isIndex',
      width: 60,
      render: (isIndex: boolean) => isIndex ? '是' : '否',
    },
    {
      title: '外键',
      dataIndex: 'isForeign',
      key: 'isForeign',
      width: 60,
      render: (isForeign: boolean) => isForeign ? '是' : '否',
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
  ];

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
      <div style={{ display: 'flex', height: 'calc(100vh - 130px)' }}>
        <div style={{ width: 250, borderRight: '1px solid #f0f0f0', marginRight: 16, height: '100%', overflow: 'auto' }}>
          <Search
            placeholder="搜索表"
            allowClear
            onChange={e => setFilter(e.target.value)}
            style={{ marginBottom: 8 }}
            prefix={<SearchOutlined />}
          />
          <Spin spinning={loading}>
            {tables.length > 0 ? (
              <Tree
                treeData={getTreeData()}
                defaultExpandAll
                selectedKeys={selectedKeys}
                onSelect={(keys, info) => {
                  if (info.node.isLeaf) {
                    handleTableSelect(info.node.key as string);
                  }
                }}
              />
            ) : (
              <div style={{ padding: 16, color: '#999', textAlign: 'center' }}>
                {loading ? '加载中...' : '暂无数据表'}
              </div>
            )}
          </Spin>
        </div>
        
        <div style={{ flex: 1 }}>
          {activeTable ? (
            <Tabs defaultActiveKey="structure">
              <TabPane tab="表结构" key="structure">
                <Table
                  columns={structureColumns}
                  dataSource={tableStructure}
                  rowKey="name"
                  size="small"
                  pagination={false}
                  loading={loading}
                  scroll={{ x: 'max-content' }}
                />
              </TabPane>
              <TabPane tab="表数据" key="data">
                <Table
                  columns={tableColumns}
                  dataSource={tableData}
                  rowKey={(record, index) => index.toString()}
                  size="small"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                  loading={loading}
                  scroll={{ x: 'max-content' }}
                />
              </TabPane>
              <TabPane tab="SQL查询" key="sql">
                <SqlEditor connectionId={connection?.id || 0} />
              </TabPane>
            </Tabs>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: 50 }}>
                <p>请从左侧选择一个表</p>
                <Button type="primary" onClick={loadTables} loading={loading}>
                  刷新表列表
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ConnectionDetailPanel;