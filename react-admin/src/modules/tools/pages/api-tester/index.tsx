import React, { useState } from 'react';
import { Tabs, Button, Spin, Typography, message, Modal, Form } from 'antd';
import { CloudUploadOutlined, SaveOutlined } from '@ant-design/icons';
import RequestPanel from './components/request-panel';
import ResponsePanel from './components/response-panel';
import HistoryPanel from './components/history-panel';
import TemplatePanel from './components/template-panel';
import TemplateForm from './components/template-form';
import { ApiTestRequest, ApiTestResponse, HttpMethod, ContentType } from '@/modules/tools/types/api-tester';
import { sendApiTestRequest, createApiTestTemplate } from '@/modules/tools/api/api-tester-api';

const { TabPane } = Tabs;
const { Title } = Typography;

/**
 * API测试工具主组件
 * 整合请求、响应、历史记录和模板管理功能
 */
const ApiTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [loading, setLoading] = useState(false);
  const [saveTemplateVisible, setSaveTemplateVisible] = useState(false);
  const [templateForm] = Form.useForm();
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

  // 显示保存模板对话框
  const showSaveTemplateModal = () => {
    if (!requestData.url) {
      message.error('请输入请求URL');
      return;
    }

    templateForm.setFieldsValue({
      ...requestData,
      name: requestData.name || '',
      description: requestData.description || ''
    });
    setSaveTemplateVisible(true);
  };

  // 保存请求模板
  const handleSaveTemplate = async (values: any) => {
    try {
      setLoading(true);
      await createApiTestTemplate({
        ...requestData,
        ...values
      });
      message.success('模板保存成功');
      setSaveTemplateVisible(false);
      
      // 如果当前在模板标签页，刷新模板列表
      if (activeTab === 'template') {
        setActiveTab('template');
      }
    } catch (error) {
      message.error('保存模板失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  // 从模板加载请求
  const handleLoadFromTemplate = (template: ApiTestRequest) => {
    setRequestData(template);
    setActiveTab('request');
  };

  return (
    <div className="api-tester-container">
      <Title level={3}>接口测试工具</Title>
      <div className="api-tester-description">
        <p>该工具可用于测试各类API接口，支持所有HTTP方法、自定义请求头和参数，并可记录测试历史和保存常用模板。</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          activeTab === 'request' && (
            <div className="action-buttons">
              <Button type="primary" icon={<CloudUploadOutlined />} loading={loading} onClick={handleSendRequest} style={{ marginRight: 8 }}>
                发送请求
              </Button>
              <Button icon={<SaveOutlined />} onClick={showSaveTemplateModal}>
                保存模板
              </Button>
            </div>
          )
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

        <TabPane tab="模板管理" key="template">
          <TemplatePanel onLoadTemplate={handleLoadFromTemplate} />
        </TabPane>
      </Tabs>

      {/* 保存模板表单模态框 */}
      <Modal
        title="保存为模板"
        open={saveTemplateVisible}
        onCancel={() => setSaveTemplateVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TemplateForm
          form={templateForm}
          initialValues={null}
          onSubmit={handleSaveTemplate}
          onCancel={() => setSaveTemplateVisible(false)}
          loading={loading}
          simpleMode={true}
        />
      </Modal>
    </div>
  );
};

export default ApiTester;
