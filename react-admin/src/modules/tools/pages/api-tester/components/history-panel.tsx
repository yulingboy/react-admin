import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Popconfirm, message, Select, DatePicker, Tag, Tooltip, Modal } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { ApiTestHistory, HttpMethod } from '@/modules/tools/types/api-tester';
import JsonEditor from './json-editor';
import dayjs from 'dayjs';
import { batchDeleteApiTestHistory, deleteApiTestHistory, getApiTestHistoryList } from '@/modules/tools/api/api-tester-api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface HistoryPanelProps {
  onLoadHistory: (historyItem: ApiTestHistory) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onLoadHistory }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ApiTestHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState({
    name: '',
    method: undefined as HttpMethod | undefined,
    url: '',
    startTime: '',
    endTime: ''
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentHistory, setCurrentHistory] = useState<ApiTestHistory | null>(null);
  const [viewMode, setViewMode] = useState<'request' | 'response'>('request');

  // 加载历史记录列表
  const loadHistoryList = async () => {
    try {
      setLoading(true);
      const result = await getApiTestHistoryList({
        current,
        pageSize,
        ...queryParams
      });
      setList(result.list);
      setTotal(result.total);
    } catch (error) {
      message.error('加载历史记录失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和查询参数变化时加载数据
  useEffect(() => {
    loadHistoryList();
  }, [current, pageSize, queryParams]);

  // 处理查询
  const handleSearch = () => {
    setPage(1);
  };

  // 处理重置
  const handleReset = () => {
    setQueryParams({
      name: '',
      method: undefined,
      url: '',
      startTime: '',
      endTime: ''
    });
    setPage(1);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await deleteApiTestHistory(id);
      message.success('删除成功');
      loadHistoryList();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    try {
      await batchDeleteApiTestHistory(selectedRowKeys as number[]);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      loadHistoryList();
    } catch (error) {
      message.error('批量删除失败');
      console.error(error);
    }
  };

  // 查看历史记录详情
  const handleView = (record: ApiTestHistory) => {
    setCurrentHistory(record);
    setViewMode('request');
    setViewModalVisible(true);
  };

  // 获取请求方法对应的标签颜色
  const getMethodColor = (method: HttpMethod) => {
    switch (method) {
      case HttpMethod.GET:
        return 'green';
      case HttpMethod.POST:
        return 'blue';
      case HttpMethod.PUT:
        return 'orange';
      case HttpMethod.DELETE:
        return 'red';
      case HttpMethod.PATCH:
        return 'purple';
      default:
        return 'default';
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      render: (method: HttpMethod) => <Tag color={getMethodColor(method)}>{method}</Tag>
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '状态码',
      dataIndex: 'response',
      key: 'status',
      render: (response: any) => {
        if (!response) return '-';
        const status = response.status;
        let color = 'default';
        if (status >= 200 && status < 300) color = 'success';
        if (status >= 300 && status < 400) color = 'warning';
        if (status >= 400) color = 'error';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: ApiTestHistory) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" onClick={() => onLoadHistory(record)}>
            加载
          </Button>
          <Popconfirm title="确定要删除这条历史记录吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="history-panel">
      <Card>
        <div className="search-form" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="请求名称"
              value={queryParams.name}
              onChange={e => setQueryParams({ ...queryParams, name: e.target.value })}
              style={{ width: 200 }}
            />
            <Select
              placeholder="请求方法"
              value={queryParams.method}
              onChange={value => setQueryParams({ ...queryParams, method: value })}
              allowClear
              style={{ width: 120 }}
            >
              {Object.values(HttpMethod).map(method => (
                <Option key={method} value={method}>
                  {method}
                </Option>
              ))}
            </Select>
            <Input
              placeholder="请求URL"
              value={queryParams.url}
              onChange={e => setQueryParams({ ...queryParams, url: e.target.value })}
              style={{ width: 200 }}
            />
            <RangePicker
              onChange={dates => {
                if (dates) {
                  setQueryParams({
                    ...queryParams,
                    startTime: dates[0]?.format('YYYY-MM-DD') || '',
                    endTime: dates[1]?.format('YYYY-MM-DD') || ''
                  });
                } else {
                  setQueryParams({
                    ...queryParams,
                    startTime: '',
                    endTime: ''
                  });
                }
              }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        <div className="table-operations" style={{ marginBottom: 16 }}>
          <Space>
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>
              批量删除
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadHistoryList}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          columns={columns}
          dataSource={list}
          rowKey="id"
          pagination={{
            current,
            pageSize,
            total,
            onChange: p => setPage(p),
            onShowSizeChange: (_, size) => setPageSize(size),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`
          }}
          loading={loading}
          size="small"
        />
      </Card>

      {/* 查看详情模态框 */}
      <Modal
        title={`历史记录详情: ${currentHistory?.name || ''}`}
        open={viewModalVisible}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
          <Button key="switch" type="primary" onClick={() => setViewMode(viewMode === 'request' ? 'response' : 'request')}>
            查看{viewMode === 'request' ? '响应' : '请求'}
          </Button>,
          <Button
            key="load"
            type="primary"
            onClick={() => {
              if (currentHistory) {
                onLoadHistory(currentHistory);
                setViewModalVisible(false);
              }
            }}
          >
            加载此请求
          </Button>
        ]}
        onCancel={() => setViewModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <div style={{ marginBottom: '10px' }}>
          <Tag color={currentHistory?.method ? getMethodColor(currentHistory.method) : 'default'}>{currentHistory?.method}</Tag>
          <span style={{ marginLeft: '8px', wordBreak: 'break-all' }}>{currentHistory?.url}</span>
        </div>

        {viewMode === 'request' && currentHistory?.request && <JsonEditor value={currentHistory.request} readOnly height="400px" />}

        {viewMode === 'response' && currentHistory?.response && <JsonEditor value={currentHistory.response} readOnly height="400px" />}
      </Modal>
    </div>
  );
};

export default HistoryPanel;
