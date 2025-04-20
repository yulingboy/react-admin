import React, { useState } from 'react';
import { Button, Dropdown, Menu, Modal, Form, Input, DatePicker, Radio, Checkbox, Space, Tooltip } from 'antd';
import { 
  ReloadOutlined, 
  ApiOutlined, 
  DownloadOutlined, 
  SettingOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  BulbOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ApiExportQueryParams, exportApiMonitorData } from '@/api/api-monitor.api';

interface ApiMonitorHeaderProps {
  refreshInterval: number;
  onIntervalChange: (interval: number) => void;
  onRefresh: () => void;
  loading: boolean;
  showAlertsModal: () => void;
}

const ApiMonitorHeader: React.FC<ApiMonitorHeaderProps> = ({ 
  refreshInterval, 
  onIntervalChange, 
  onRefresh, 
  loading,
  showAlertsModal 
}) => {
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportForm] = Form.useForm();
  const [exportLoading, setExportLoading] = useState(false);
  const [testDataGenerating, setTestDataGenerating] = useState(false);
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [cleanupForm] = Form.useForm();
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // 打开导出数据模态框
  const showExportModal = () => {
    exportForm.resetFields();
    setExportModalVisible(true);
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const values = await exportForm.validateFields();
      setExportLoading(true);
      
      const params: ApiExportQueryParams = {
        format: values.format,
        includeDetails: values.includeDetails,
      };
      
      if (values.dateRange) {
        params.startDate = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
      }
      
      const response = await exportApiMonitorData(params);
      
      // 创建下载链接
      const blob = new Blob([response], { 
        type: values.format === 'csv' 
          ? 'text/csv' 
          : values.format === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-monitor-export-${dayjs().format('YYYY-MM-DD')}.${
        values.format === 'excel' ? 'xlsx' : values.format
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportModalVisible(false);
    } catch (error) {
      console.error('导出数据失败:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // 生成测试数据
  const handleGenerateTestData = async () => {
    try {
      setTestDataGenerating(true);
      const result = await generateTestData();
      if (result.success) {
        Modal.success({
          title: '生成成功',
          content: `成功生成测试数据：${result.count?.monitor || 0}条监控记录，${result.count?.details || 0}条详细记录，${result.count?.alerts || 0}条告警配置`,
        });
        onRefresh(); // 刷新数据
      } else {
        Modal.error({
          title: '生成失败',
          content: result.message || '测试数据生成失败',
        });
      }
    } catch (error) {
      console.error('生成测试数据失败:', error);
      Modal.error({
        title: '生成失败',
        content: '测试数据生成失败，请查看控制台获取详细错误信息',
      });
    } finally {
      setTestDataGenerating(false);
    }
  };

  // 打开清理数据模态框
  const showCleanupModal = () => {
    cleanupForm.resetFields();
    setCleanupModalVisible(true);
  };

  // 清理旧数据
  const handleCleanup = async () => {
    try {
      const values = await cleanupForm.validateFields();
      setCleanupLoading(true);
      
      const result = await cleanupOldData(values.daysToKeep);
      
      if (result.success) {
        Modal.success({
          title: '清理成功',
          content: `成功清理${values.daysToKeep}天前的数据：${result.deletedCount?.monitor || 0}条监控记录，${result.deletedCount?.details || 0}条详细记录`,
        });
        onRefresh(); // 刷新数据
        setCleanupModalVisible(false);
      } else {
        Modal.error({
          title: '清理失败',
          content: result.message || '数据清理失败',
        });
      }
    } catch (error) {
      console.error('清理旧数据失败:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  // 设置菜单
  const settingsMenu = (
    <Menu>
      <Menu.Item key="generateTestData" icon={<DatabaseOutlined />} onClick={handleGenerateTestData} disabled={testDataGenerating}>
        生成测试数据
      </Menu.Item>
      <Menu.Item key="cleanupData" icon={<DeleteOutlined />} onClick={showCleanupModal}>
        清理旧数据
      </Menu.Item>
      <Menu.Item key="configAlerts" icon={<BulbOutlined />} onClick={showAlertsModal}>
        告警配置
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border-b border-gray-200">
      <div className="flex items-center mb-4 md:mb-0">
        <ApiOutlined className="text-blue-500 text-xl" />
        <span className="ml-2 text-lg font-medium">API监控</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded overflow-hidden border border-gray-200">
          <Button type={refreshInterval === 30000 ? 'primary' : 'default'} onClick={() => onIntervalChange(30000)} className="rounded-none">
            30秒
          </Button>
          <Button type={refreshInterval === 60000 ? 'primary' : 'default'} onClick={() => onIntervalChange(60000)} className="rounded-none border-l border-r">
            1分钟
          </Button>
          <Button type={refreshInterval === 300000 ? 'primary' : 'default'} onClick={() => onIntervalChange(300000)} className="rounded-none">
            5分钟
          </Button>
        </div>

        <Tooltip title="导出数据">
          <Button icon={<DownloadOutlined />} onClick={showExportModal}>
            导出
          </Button>
        </Tooltip>

        <Dropdown overlay={settingsMenu} placement="bottomRight">
          <Button icon={<SettingOutlined />}>设置</Button>
        </Dropdown>

        <Button type="primary" icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 导出数据模态框 */}
      <Modal
        title="导出API监控数据"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={handleExport}
        confirmLoading={exportLoading}
        destroyOnClose
      >
        <Form form={exportForm} layout="vertical">
          <Form.Item label="时间范围" name="dateRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="导出格式" name="format" initialValue="csv">
            <Radio.Group>
              <Radio value="csv">CSV</Radio>
              <Radio value="json">JSON</Radio>
              <Radio value="excel">Excel</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="includeDetails" valuePropName="checked" initialValue={false}>
            <Checkbox>包含详细记录（可能数据量较大）</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* 清理数据模态框 */}
      <Modal
        title="清理旧数据"
        open={cleanupModalVisible}
        onCancel={() => setCleanupModalVisible(false)}
        onOk={handleCleanup}
        confirmLoading={cleanupLoading}
        destroyOnClose
      >
        <Form form={cleanupForm} layout="vertical">
          <Form.Item
            label="保留天数"
            name="daysToKeep"
            initialValue={30}
            rules={[{ required: true, message: '请输入保留天数' }]}
            help="将删除指定天数之前的所有监控数据，请谨慎操作"
          >
            <Input type="number" min={1} max={365} />
          </Form.Item>
        </Form>
        <div className="text-red-500 text-xs mt-2">
          警告：此操作不可逆，将永久删除指定日期之前的数据，请确认后再操作
        </div>
      </Modal>
    </div>
  );
};

export default ApiMonitorHeader;
