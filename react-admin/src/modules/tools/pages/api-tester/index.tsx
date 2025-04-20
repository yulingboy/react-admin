import React, { useState } from 'react';
import {  Tabs, Button, Spin, Typography, message } from 'antd';
import { CloudUploadOutlined,    SaveOutlined } from '@ant-design/icons';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';
import HistoryPanel from './components/HistoryPanel';
import { ApiTestRequest, ApiTestResponse, HttpMethod, ContentType } from '@/modules/tools/types/api-tester';
import { sendApiTestRequest } from '@/modules/tools/api/api-tester-api';

const { TabPane } = Tabs;
const { Title } = Typography;

const ApiTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<ApiTestRequest>({
    url: '',
    method: HttpMethod.GET,
    headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
    params: [],
    contentType: ContentType.JSON
  });
  const [response, setResponse] = useState<ApiTestResponse | null>(null);

  // 处理请求发送
  const handleSendRequest = async () => {
    if (!requestData.url) {
      message.error('请输入请求URL');
      return;
    }

    try {
      setLoading(true);
      const result = await sendApiTestRequest(requestData);
      setResponse(result);
      setActiveTab('response');
    } catch (error) {
      message.error('请求发送失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 保存请求模板
  const handleSaveTemplate = () => {
    if (!requestData.url) {
      message.error('请输入请求URL');
      return;
    }

    if (!requestData.name) {
      message.error('请输入模板名称');
      return;
    }

    // 这里可以添加保存模板的逻辑
    message.info('保存模板功能将在下一个版本实现');
  };

  // 更新请求数据
  const handleRequestChange = (newRequestData: Partial<ApiTestRequest>) => {
    setRequestData(prev => ({
      ...prev,
      ...newRequestData
    }));
  };

  // 从历史记录加载请求
  const handleLoadFromHistory = (historyItem: any) => {
    setRequestData(historyItem.request);
    if (historyItem.response) {
      setResponse(historyItem.response);
    }
    setActiveTab('request');
  };

  return (
    <div className="api-tester-container">
      <Title level={3}>接口测试工具</Title>
      <div className="api-tester-description">
        <p>该工具可用于测试各类API接口，支持所有HTTP方法、自定义请求头和参数，并可记录测试历史。</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <div className="action-buttons">
            <Button type="primary" icon={<CloudUploadOutlined />} loading={loading} onClick={handleSendRequest} style={{ marginRight: 8 }}>
              发送请求
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveTemplate} disabled={!requestData.name || !requestData.url}>
              保存模板
            </Button>
          </div>
        }
      >
        <TabPane tab="请求" key="request">
          <Spin spinning={loading}>
            <RequestPanel requestData={requestData} onChange={handleRequestChange} />
          </Spin>
        </TabPane>

        <TabPane tab="响应" key="response" disabled={!response}>
          <ResponsePanel response={response} />
        </TabPane>

        <TabPane tab="历史记录" key="history">
          <HistoryPanel onLoadHistory={handleLoadFromHistory} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ApiTester;
