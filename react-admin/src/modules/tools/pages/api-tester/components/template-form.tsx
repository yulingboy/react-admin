import React from 'react';
import { Form, Input, Select, Button, Tabs, Space, Table, Switch, FormInstance } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ContentType, HttpMethod, ApiTestTemplate, HeaderItem, ParamItem } from '@/modules/tools/types/api-tester';
import JsonEditor from './json-editor';

const { TabPane } = Tabs;
const { Option } = Select;

/**
 * API测试模板表单属性
 */
interface TemplateFormProps {
  form: FormInstance;
  initialValues: ApiTestTemplate | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading: boolean;
  simpleMode?: boolean; // 是否使用简单模式（仅显示名称和描述）
}

/**
 * API测试模板表单
 * 用于创建和编辑API测试模板
 */
const TemplateForm: React.FC<TemplateFormProps> = ({ form, initialValues, onSubmit, onCancel, loading, simpleMode = false }) => {
  // 表单默认值
  const defaultValues = {
    name: '',
    url: '',
    method: HttpMethod.GET,
    headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
    params: [],
    body: {},
    contentType: ContentType.JSON,
    description: ''
  };

  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    }).catch(err => {
      console.error('表单验证失败:', err);
    });
  };

  // 添加请求头
  const addHeader = () => {
    const headers = form.getFieldValue('headers') || [];
    form.setFieldsValue({
      headers: [...headers, { key: '', value: '', enabled: true }]
    });
  };

  // 删除请求头
  const removeHeader = (index: number) => {
    const headers = form.getFieldValue('headers') || [];
    form.setFieldsValue({
      headers: headers.filter((_: any, i: number) => i !== index)
    });
  };

  // 更新请求头
  const updateHeader = (index: number, field: keyof HeaderItem, value: any) => {
    const headers = form.getFieldValue('headers') || [];
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    form.setFieldsValue({ headers: newHeaders });
  };

  // 添加请求参数
  const addParam = () => {
    const params = form.getFieldValue('params') || [];
    form.setFieldsValue({
      params: [...params, { key: '', value: '', description: '', enabled: true }]
    });
  };

  // 删除请求参数
  const removeParam = (index: number) => {
    const params = form.getFieldValue('params') || [];
    form.setFieldsValue({
      params: params.filter((_: any, i: number) => i !== index)
    });
  };

  // 更新请求参数
  const updateParam = (index: number, field: keyof ParamItem, value: any) => {
    const params = form.getFieldValue('params') || [];
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    form.setFieldsValue({ params: newParams });
  };

  // 更新请求体
  const updateBody = (body: any) => {
    form.setFieldsValue({ body });
  };

  // 请求头表格列
  const headerColumns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Switch
          checked={form.getFieldValue(['headers', index, 'enabled'])}
          size="small"
          onChange={checked => updateHeader(index, 'enabled', checked)}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'key',
      render: (_: any, __: any, index: number) => (
        <Input
          value={form.getFieldValue(['headers', index, 'key'])}
          placeholder="Header名称"
          onChange={e => updateHeader(index, 'key', e.target.value)}
        />
      )
    },
    {
      title: '值',
      dataIndex: 'value',
      render: (_: any, __: any, index: number) => (
        <Input
          value={form.getFieldValue(['headers', index, 'value'])}
          placeholder="Header值"
          onChange={e => updateHeader(index, 'value', e.target.value)}
        />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeHeader(index)} />
      )
    }
  ];

  // 请求参数表格列
  const paramColumns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Switch
          checked={form.getFieldValue(['params', index, 'enabled'])}
          size="small"
          onChange={checked => updateParam(index, 'enabled', checked)}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'key',
      render: (_: any, __: any, index: number) => (
        <Input
          value={form.getFieldValue(['params', index, 'key'])}
          placeholder="参数名称"
          onChange={e => updateParam(index, 'key', e.target.value)}
        />
      )
    },
    {
      title: '值',
      dataIndex: 'value',
      render: (_: any, __: any, index: number) => (
        <Input
          value={form.getFieldValue(['params', index, 'value'])}
          placeholder="参数值"
          onChange={e => updateParam(index, 'value', e.target.value)}
        />
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      render: (_: any, __: any, index: number) => (
        <Input
          value={form.getFieldValue(['params', index, 'description'])}
          placeholder="参数描述(可选)"
          onChange={e => updateParam(index, 'description', e.target.value)}
        />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeParam(index)} />
      )
    }
  ];

  // 简单模式下只显示名称和描述字段
  if (simpleMode) {
    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || defaultValues}
        onFinish={handleSubmit}
      >
        <Form.Item label="模板名称" name="name" rules={[{ required: true, message: '请输入模板名称' }]}>
          <Input placeholder="请输入模板名称" />
        </Form.Item>

        <Form.Item label="模板描述" name="description">
          <Input.TextArea rows={4} placeholder="请输入模板描述(可选)" />
        </Form.Item>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </Space>
        </div>
      </Form>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || defaultValues}
      onFinish={handleSubmit}
    >
      <Form.Item label="模板名称" name="name" rules={[{ required: true, message: '请输入模板名称' }]}>
        <Input placeholder="请输入模板名称" />
      </Form.Item>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item label="请求方法" name="method" style={{ width: '150px' }} rules={[{ required: true, message: '请选择请求方法' }]}>
          <Select>
            {Object.values(HttpMethod).map(method => (
              <Option key={method} value={method}>
                {method}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="请求URL" name="url" style={{ flex: 1 }} rules={[{ required: true, message: '请输入完整URL' }]}>
          <Input placeholder="输入完整URL，如 https://api.example.com/users" />
        </Form.Item>
      </div>

      <Form.Item label="内容类型" name="contentType" style={{ width: '300px' }} rules={[{ required: true, message: '请选择内容类型' }]}>
        <Select>
          <Option value={ContentType.JSON}>application/json</Option>
          <Option value={ContentType.FORM}>application/x-www-form-urlencoded</Option>
          <Option value={ContentType.MULTIPART}>multipart/form-data</Option>
          <Option value={ContentType.XML}>application/xml</Option>
          <Option value={ContentType.TEXT}>text/plain</Option>
        </Select>
      </Form.Item>

      <Form.Item label="模板描述" name="description">
        <Input.TextArea rows={2} placeholder="请输入模板描述(可选)" />
      </Form.Item>

      <Tabs defaultActiveKey="headers">
        <TabPane tab="请求头" key="headers">
          <div style={{ marginBottom: '10px' }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addHeader} block>
              添加请求头
            </Button>
          </div>
          <Form.Item name="headers" hidden>
            <Input />
          </Form.Item>
          <Table
            columns={headerColumns}
            dataSource={form.getFieldValue('headers') || []}
            rowKey={(_, index) => `header-${index}`}
            pagination={false}
            size="small"
          />
        </TabPane>

        <TabPane tab="请求参数" key="params">
          <div style={{ marginBottom: '10px' }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addParam} block>
              添加请求参数
            </Button>
          </div>
          <Form.Item name="params" hidden>
            <Input />
          </Form.Item>
          <Table
            columns={paramColumns}
            dataSource={form.getFieldValue('params') || []}
            rowKey={(_, index) => `param-${index}`}
            pagination={false}
            size="small"
          />
        </TabPane>

        <TabPane tab="请求体" key="body" disabled={form.getFieldValue('method') === HttpMethod.GET || form.getFieldValue('method') === HttpMethod.HEAD}>
          <Form.Item name="body" hidden>
            <Input />
          </Form.Item>
          <JsonEditor
            value={form.getFieldValue('body') || {}}
            onChange={updateBody}
            height="300px"
          />
        </TabPane>
      </Tabs>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default TemplateForm;