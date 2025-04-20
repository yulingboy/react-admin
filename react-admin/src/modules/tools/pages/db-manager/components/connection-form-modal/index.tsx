import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Button, message } from 'antd';
import { DatabaseConnection, DatabaseType } from '@/modules/tools/types/db-manager';
import { LoadingOutlined } from '@ant-design/icons';
import useDictionary from '@/hooks/useDictionaryBack';
import { testDatabaseConnection } from '@/modules/tools/api/db-manager-api';

interface ConnectionFormModalProps {
  visible: boolean;
  title: string;
  initialValues?: Partial<DatabaseConnection>;
  onCancel: () => void;
  onSubmit: (values: Partial<DatabaseConnection>) => void;
}

const ConnectionFormModal: React.FC<ConnectionFormModalProps> = ({ visible, title, initialValues, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [dbType, setDbType] = useState<DatabaseType>(initialValues?.type || DatabaseType.MYSQL);
  const { selectOptions: statusSlectOptions } = useDictionary('sys_common_status');

  // 当初始值变化时重置表单
  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
      setDbType(initialValues.type || DatabaseType.MYSQL);
    } else if (visible) {
      form.resetFields();
      setDbType(DatabaseType.MYSQL);
      form.setFieldsValue({
        status: '1',
        isSystem: '0',
        port: getDefaultPort(DatabaseType.MYSQL),
        ssl: false
      });
    }
  }, [visible, initialValues, form]);

  // 根据数据库类型获取默认端口
  const getDefaultPort = (type: DatabaseType): number => {
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return 3306;
      case DatabaseType.POSTGRES:
        return 5432;
      case DatabaseType.MSSQL:
        return 1433;
      default:
        return 0;
    }
  };

  // 处理数据库类型变化
  const handleDatabaseTypeChange = (value: DatabaseType) => {
    setDbType(value);

    if (value !== DatabaseType.SQLITE) {
      form.setFieldValue('port', getDefaultPort(value));
    }
  };

  // 测试连接
  const handleTestConnection = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setTesting(true);
      const { success, message: msg } = await testDatabaseConnection(values);

      message[success ? 'success' : 'error'](msg);
    } catch (error) {
      // 表单验证失败，不处理
    } finally {
      setTesting(false);
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      destroyOnClose
      maskClosable={false}
      footer={[
        <Button key="test" onClick={handleTestConnection} disabled={testing}>
          {testing ? <LoadingOutlined /> : null} 测试连接
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          确定
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: '1',
          isSystem: '0',
          ssl: false,
          port: 3306
        }}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="name" label="连接名称" rules={[{ required: true, message: '请输入连接名称' }]}>
          <Input placeholder="请输入连接名称" maxLength={50} />
        </Form.Item>

        <Form.Item name="type" label="数据库类型" rules={[{ required: true, message: '请选择数据库类型' }]}>
          <Select onChange={handleDatabaseTypeChange}>
            <Select.Option value={DatabaseType.MYSQL}>MySQL</Select.Option>
            <Select.Option value={DatabaseType.POSTGRES}>PostgreSQL</Select.Option>
            <Select.Option value={DatabaseType.MSSQL}>SQL Server</Select.Option>
            <Select.Option value={DatabaseType.MARIADB}>MariaDB</Select.Option>
            <Select.Option value={DatabaseType.SQLITE}>SQLite</Select.Option>
          </Select>
        </Form.Item>

        {dbType === DatabaseType.SQLITE ? (
          <Form.Item name="filename" label="数据库文件路径" rules={[{ required: true, message: '请输入数据库文件路径' }]}>
            <Input placeholder="请输入SQLite数据库文件的完整路径" />
          </Form.Item>
        ) : (
          <>
            <Form.Item name="host" label="主机地址" rules={[{ required: true, message: '请输入主机地址' }]}>
              <Input placeholder="请输入主机地址" />
            </Form.Item>

            <Form.Item name="port" label="端口" rules={[{ required: true, message: '请输入端口' }]}>
              <InputNumber min={1} max={65535} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item name="ssl" label="启用SSL" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )}

        <Form.Item name="database" label="数据库名" rules={[{ required: true, message: '请输入数据库名' }]}>
          <Input placeholder="请输入数据库名" />
        </Form.Item>

        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select options={statusSlectOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConnectionFormModal;
