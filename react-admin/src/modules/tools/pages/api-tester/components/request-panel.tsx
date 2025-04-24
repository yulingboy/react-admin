import React, { useState } from 'react';
import { Form, Input, Select, Tabs, Button, Space, Table, Switch, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ApiTestRequest, HttpMethod, ContentType, HeaderItem, ParamItem } from '@/modules/tools/types/api-tester';
import JsonEditor from './json-editor';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

interface RequestPanelProps {
  requestData: ApiTestRequest;
  onChange: (data: Partial<ApiTestRequest>) => void;
}

const RequestPanel: React.FC<RequestPanelProps> = ({ requestData, onChange }) => {
  const [activeTab, setActiveTab] = useState('params');

  // 添加请求头
  const addHeader = () => {
    const newHeaders = [...requestData.headers, { key: '', value: '', enabled: true }];
    onChange({ headers: newHeaders });
  };

  // 更新请求头
  const updateHeader = (index: number, field: keyof HeaderItem, value: any) => {
    const newHeaders = [...requestData.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onChange({ headers: newHeaders });
  };

  // 删除请求头
  const removeHeader = (index: number) => {
    const newHeaders = [...requestData.headers];
    newHeaders.splice(index, 1);
    onChange({ headers: newHeaders });
  };

  // 添加请求参数
  const addParam = () => {
    const newParams = [...(requestData.params || []), { key: '', value: '', description: '', enabled: true }];
    onChange({ params: newParams });
  };

  // 更新请求参数
  const updateParam = (index: number, field: keyof ParamItem, value: any) => {
    const newParams = [...(requestData.params || [])];
    newParams[index] = { ...newParams[index], [field]: value };
    onChange({ params: newParams });
  };

  // 删除请求参数
  const removeParam = (index: number) => {
    const newParams = [...(requestData.params || [])];
    newParams.splice(index, 1);
    onChange({ params: newParams });
  };

  // 更新请求体
  const updateBody = (body: any) => {
    onChange({ body });
  };

  const headerColumns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (enabled: boolean, _: any, index: number) => (
        <Switch checked={enabled} size="small" onChange={checked => updateHeader(index, 'enabled', checked)} />
      )
    },
    {
      title: '名称',
      dataIndex: 'key',
      render: (key: string, _: any, index: number) => <Input value={key} placeholder="Header名称" onChange={e => updateHeader(index, 'key', e.target.value)} />
    },
    {
      title: '值',
      dataIndex: 'value',
      render: (value: string, _: any, index: number) => (
        <Input value={value} placeholder="Header值" onChange={e => updateHeader(index, 'value', e.target.value)} />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeHeader(index)} />
    }
  ];

  const paramColumns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (enabled: boolean, _: any, index: number) => (
        <Switch checked={enabled} size="small" onChange={checked => updateParam(index, 'enabled', checked)} />
      )
    },
    {
      title: '名称',
      dataIndex: 'key',
      render: (key: string, _: any, index: number) => <Input value={key} placeholder="参数名称" onChange={e => updateParam(index, 'key', e.target.value)} />
    },
    {
      title: '值',
      dataIndex: 'value',
      render: (value: string, _: any, index: number) => <Input value={value} placeholder="参数值" onChange={e => updateParam(index, 'value', e.target.value)} />
    },
    {
      title: '描述',
      dataIndex: 'description',
      render: (desc: string, _: any, index: number) => (
        <Input value={desc} placeholder="参数描述(可选)" onChange={e => updateParam(index, 'description', e.target.value)} />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeParam(index)} />
    }
  ];

  return (
    <div className="request-panel">
      <Card>
        <Form layout="vertical">
          <Form.Item label="请求名称">
            <Input placeholder="输入请求名称（用于保存模板）" value={requestData.name} onChange={e => onChange({ name: e.target.value })} />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item label="请求方法" style={{ width: '150px' }}>
              <Select value={requestData.method} onChange={value => onChange({ method: value })}>
                {Object.values(HttpMethod).map(method => (
                  <Option key={method} value={method}>
                    {method}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="请求URL" style={{ flex: 1 }}>
              <Input placeholder="输入完整URL，如 https://api.example.com/users" value={requestData.url} onChange={e => onChange({ url: e.target.value })} />
            </Form.Item>
          </div>

          <Form.Item label="内容类型" style={{ width: '300px' }}>
            <Select value={requestData.contentType} onChange={value => onChange({ contentType: value })}>
              <Option value={ContentType.JSON}>application/json</Option>
              <Option value={ContentType.FORM}>application/x-www-form-urlencoded</Option>
              <Option value={ContentType.MULTIPART}>multipart/form-data</Option>
              <Option value={ContentType.XML}>application/xml</Option>
              <Option value={ContentType.TEXT}>text/plain</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: '16px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="请求头" key="headers">
            <div style={{ marginBottom: '10px' }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={addHeader} block>
                添加请求头
              </Button>
            </div>
            <Table columns={headerColumns} dataSource={requestData.headers} rowKey={(record, index) => `header-${index}`} pagination={false} size="small" />
          </TabPane>

          <TabPane tab="请求参数" key="params">
            <div style={{ marginBottom: '10px' }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={addParam} block>
                添加请求参数
              </Button>
            </div>
            <Table columns={paramColumns} dataSource={requestData.params} rowKey={(record, index) => `param-${index}`} pagination={false} size="small" />
            <Text type="secondary" style={{ display: 'block', marginTop: '10px' }}>
              请求参数将会被自动添加到URL中作为查询字符串
            </Text>
          </TabPane>

          <TabPane tab="请求体" key="body" disabled={requestData.method === HttpMethod.GET || requestData.method === HttpMethod.HEAD}>
            <JsonEditor value={requestData.body || {}} onChange={updateBody} height="300px" />
            <Text type="secondary" style={{ display: 'block', marginTop: '10px' }}>
              {requestData.contentType === ContentType.JSON ? '请输入符合JSON格式的请求体' : '请根据选择的Content-Type输入对应格式的请求体'}
            </Text>
          </TabPane>

          <TabPane tab="高级选项" key="advanced">
            <Form layout="vertical">
              <Form.Item label="超时时间(毫秒)">
                <Input
                  type="number"
                  placeholder="默认为10000毫秒(10秒)"
                  value={requestData.timeout}
                  onChange={e => onChange({ timeout: Number(e.target.value) })}
                />
              </Form.Item>
              <Form.Item label="接口描述">
                <Input.TextArea
                  rows={4}
                  placeholder="输入接口描述信息(可选)"
                  value={requestData.description}
                  onChange={e => onChange({ description: e.target.value })}
                />
              </Form.Item>
              <Form.Item>
                <Switch checked={requestData.saveToHistory !== false} onChange={checked => onChange({ saveToHistory: checked })} /> 保存到历史记录
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default RequestPanel;
