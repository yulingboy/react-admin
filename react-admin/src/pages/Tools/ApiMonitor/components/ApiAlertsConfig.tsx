import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Tooltip, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getApiAlertConfigs, saveApiAlertConfig, deleteApiAlertConfig } from '@/api/system-monitor';
import type { ApiAlertConfig } from '@/api/system-monitor';

const ApiAlertsConfig: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [alertConfigs, setAlertConfigs] = useState<ApiAlertConfig[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<ApiAlertConfig | null>(null);
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  // 获取告警配置列表
  const fetchAlertConfigs = async () => {
    try {
      setLoading(true);
      const configs = await getApiAlertConfigs();
      setAlertConfigs(configs);
    } catch (error) {
      console.error('获取告警配置失败:', error);
      message.error('获取告警配置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAlertConfigs();
    }
  }, [visible]);

  // 打开编辑模态框
  const handleEdit = (record?: ApiAlertConfig) => {
    setCurrentAlert(record || null);
    form.resetFields();
    
    if (record) {
      form.setFieldsValue({
        id: record.id,
        path: record.path || '',
        responseTimeThreshold: record.responseTimeThreshold,
        errorRateThreshold: record.errorRateThreshold,
        enabled: record.enabled,
      });
    } else {
      form.setFieldsValue({
        responseTimeThreshold: 1000,
        errorRateThreshold: 5,
        enabled: true,
      });
    }
    
    setEditModalVisible(true);
  };

  // 保存告警配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaveLoading(true);
      
      // 如果路径为空字符串，设为null表示全局配置
      if (values.path === '') {
        values.path = null;
      }
      
      // 如果是编辑模式，包含ID
      if (currentAlert?.id) {
        values.id = currentAlert.id;
      }
      
      const result = await saveApiAlertConfig(values);
      message.success('告警配置保存成功');
      setEditModalVisible(false);
      fetchAlertConfigs(); // 刷新列表
    } catch (error) {
      console.error('保存告警配置失败:', error);
      message.error('保存告警配置失败，请稍后重试');
    } finally {
      setSaveLoading(false);
    }
  };

  // 删除告警配置
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await deleteApiAlertConfig(id);
      message.success('告警配置删除成功');
      fetchAlertConfigs(); // 刷新列表
    } catch (error) {
      console.error('删除告警配置失败:', error);
      message.error('删除告警配置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => text || '全局（适用于所有API）',
    },
    {
      title: (
        <span>
          响应时间阈值 
          <Tooltip title="当API响应时间超过此阈值时触发告警">
            <QuestionCircleOutlined className="ml-1" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'responseTimeThreshold',
      key: 'responseTimeThreshold',
      render: (text: number) => `${text} ms`,
    },
    {
      title: (
        <span>
          错误率阈值 
          <Tooltip title="当API错误率超过此阈值时触发告警">
            <QuestionCircleOutlined className="ml-1" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'errorRateThreshold',
      key: 'errorRateThreshold',
      render: (text: number) => `${text}%`,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Switch checked={enabled} disabled />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiAlertConfig) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此告警配置?"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="API告警配置"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div className="mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleEdit()}
        >
          添加告警配置
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={alertConfigs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
      
      {/* 编辑告警配置模态框 */}
      <Modal
        title={currentAlert ? '编辑告警配置' : '添加告警配置'}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saveLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="API路径"
            name="path"
            help="留空表示全局配置，适用于所有API路径"
          >
            <Input placeholder="例如: /api/users" />
          </Form.Item>
          
          <Form.Item
            label="响应时间阈值 (ms)"
            name="responseTimeThreshold"
            rules={[
              { required: true, message: '请输入响应时间阈值' },
              { type: 'number', min: 10, message: '最小为10ms' }
            ]}
          >
            <Input type="number" min={10} />
          </Form.Item>
          
          <Form.Item
            label="错误率阈值 (%)"
            name="errorRateThreshold"
            rules={[
              { required: true, message: '请输入错误率阈值' },
              { type: 'number', min: 0, max: 100, message: '错误率应在0-100之间' }
            ]}
          >
            <Input type="number" min={0} max={100} />
          </Form.Item>
          
          <Form.Item name="enabled" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ApiAlertsConfig;