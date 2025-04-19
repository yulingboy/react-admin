import React, { useState } from 'react';
import { Card, Tabs, Table, Typography, Tag, Descriptions, Divider, Badge, Alert } from 'antd';
import { ApiTestResponse } from '@/types/api-tester';
import JsonEditor from './JsonEditor';

const { TabPane } = Tabs;
const { Text } = Typography;

interface ResponsePanelProps {
  response: ApiTestResponse | null;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body');

  if (!response) {
    return <Card>尚未发送请求或请求未返回响应</Card>;
  }

  // 获取状态码对应的标签颜色
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'error';
    return 'default';
  };

  // 将响应头转换为表格数据
  const headersData = Object.entries(response.headers).map(([key, value]) => ({
    key,
    value: typeof value === 'string' ? value : JSON.stringify(value)
  }));

  const headerColumns = [
    {
      title: '名称',
      dataIndex: 'key',
      key: 'key',
      width: '40%'
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: '60%',
      ellipsis: true
    }
  ];

  return (
    <div className="response-panel">
      <Card>
        <div className="response-summary">
          <Descriptions size="small" column={3} bordered>
            <Descriptions.Item label="状态码">
              <Badge
                status={getStatusColor(response.status) as any}
                text={
                  <span>
                    <Text strong>{response.status}</Text>
                    <Text type="secondary" style={{ marginLeft: '8px' }}>
                      {response.statusText}
                    </Text>
                  </span>
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="响应时间">{response.time} ms</Descriptions.Item>
            <Descriptions.Item label="响应大小">{(response.size / 1024).toFixed(2)} KB</Descriptions.Item>
          </Descriptions>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="响应体" key="body">
            <JsonEditor value={response.data || {}} readOnly={true} height="400px" />
          </TabPane>

          <TabPane tab="响应头" key="headers">
            <Table columns={headerColumns} dataSource={headersData} pagination={false} size="small" rowKey="key" />
          </TabPane>

          {response.error && (
            <TabPane tab="错误信息" key="error">
              <div className="error-details">
                <Alert
                  message="请求错误"
                  description={
                    <div>
                      <p>
                        <strong>状态码:</strong> {response.status}
                      </p>
                      <p>
                        <strong>错误信息:</strong> {response.statusText}
                      </p>
                      {response.data?.message && (
                        <p>
                          <strong>服务器消息:</strong> {response.data.message}
                        </p>
                      )}
                    </div>
                  }
                  type="error"
                  showIcon
                />
              </div>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default ResponsePanel;
