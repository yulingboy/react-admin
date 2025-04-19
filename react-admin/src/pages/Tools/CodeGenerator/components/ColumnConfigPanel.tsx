import React, { useState, useEffect } from 'react';
import { Drawer, Button, Table, Space, Switch, Form, Input, Select, Divider, Spin } from 'antd';
import { SyncOutlined, SaveOutlined } from '@ant-design/icons';
import { CodeGeneratorColumn, QueryType, HtmlType } from '@/types/code-generator';
import { message } from '@/hooks/useMessage';
import { syncTableColumns, updateCodeGeneratorColumn } from '@/api/code-generator';
import { DictionaryTypeSelect } from '@/components/Dictionary';

interface ColumnConfigPanelProps {
  visible: boolean;
  generatorId: number | null;
  columns: CodeGeneratorColumn[];
  onClose: () => void;
  onSync: () => void;
}

const ColumnConfigPanel: React.FC<ColumnConfigPanelProps> = ({ visible, generatorId, columns, onClose, onSync }) => {
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<CodeGeneratorColumn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible && columns) {
      setData(columns);
    }
  }, [visible, columns]);

  // 同步表结构
  const handleSync = async () => {
    if (!generatorId) return;

    setLoading(true);
    try {
      await syncTableColumns(generatorId);
      message.success('同步表结构成功');
      onSync(); // 通知父组件刷新
    } catch (error) {
      console.error('同步表结构失败:', error);
      message.error('同步表结构失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑
  const handleEdit = (record: CodeGeneratorColumn) => {
    setEditingKey(record.id);
    form.setFieldsValue(record);
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingKey(null);
  };

  // 保存编辑
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingKey === null || !generatorId) {
        message.error('生成器ID不能为空');
        return;
      }

      setLoading(true);
      await updateCodeGeneratorColumn(editingKey, values, generatorId);

      setData(prev => prev.map(item => (item.id === editingKey ? { ...item, ...values } : item)));

      setEditingKey(null);
      message.success('保存成功');
      onSync(); // 通知父组件刷新
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    {
      title: '列名',
      dataIndex: 'columnName',
      width: 150,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="columnName" style={{ margin: 0 }}>
              <Input disabled />
            </Form.Item>
          );
        }
        return record.columnName;
      }
    },
    {
      title: '列注释',
      dataIndex: 'columnComment',
      width: 150,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="columnComment" style={{ margin: 0 }}>
              <Input placeholder="请输入列注释" />
            </Form.Item>
          );
        }
        return record.columnComment || '-';
      }
    },
    {
      title: '列类型',
      dataIndex: 'columnType',
      width: 100,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="columnType" style={{ margin: 0 }} rules={[{ required: true, message: '列类型不能为空' }]}>
              <Input disabled />
            </Form.Item>
          );
        }
        return record.columnType;
      }
    },
    {
      title: 'TypeScript类型',
      dataIndex: 'tsType',
      width: 120,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="tsType" style={{ margin: 0 }} rules={[{ required: true, message: '请选择TypeScript类型' }]}>
              <Select placeholder="请选择类型">
                <Select.Option value="string">string</Select.Option>
                <Select.Option value="number">number</Select.Option>
                <Select.Option value="boolean">boolean</Select.Option>
                <Select.Option value="Date">Date</Select.Option>
                <Select.Option value="any">any</Select.Option>
              </Select>
            </Form.Item>
          );
        }
        return record.tsType;
      }
    },
    {
      title: '主键',
      dataIndex: 'isPk',
      width: 70,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="isPk" style={{ margin: 0 }} valuePropName="checked">
              <Switch disabled />
            </Form.Item>
          );
        }
        return <Switch checked={record.isPk} disabled />;
      }
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      width: 70,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="isRequired" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
        }
        return <Switch checked={record.isRequired} disabled />;
      }
    },
    {
      title: '插入',
      dataIndex: 'isInsert',
      width: 70,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="isInsert" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
        }
        return <Switch checked={record.isInsert} disabled />;
      }
    },
    {
      title: '编辑',
      dataIndex: 'isEdit',
      width: 70,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="isEdit" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
        }
        return <Switch checked={record.isEdit} disabled />;
      }
    },
    {
      title: '列表',
      dataIndex: 'isList',
      width: 70,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="isList" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
        }
        return <Switch checked={record.isList} disabled />;
      }
    },
    {
      title: '查询',
      dataIndex: 'isQuery',
      width: 70,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="isQuery" style={{ margin: 0 }} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
        }
        return <Switch checked={record.isQuery} disabled />;
      }
    },
    {
      title: '查询方式',
      dataIndex: 'queryType',
      width: 100,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="queryType" style={{ margin: 0 }}>
              <Select placeholder="请选择查询方式">
                {Object.entries(QueryType).map(([key, value]) => (
                  <Select.Option key={key} value={value}>
                    {key} ({value})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return record.queryType || '-';
      }
    },
    {
      title: 'HTML类型',
      dataIndex: 'htmlType',
      width: 100,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="htmlType" style={{ margin: 0 }}>
              <Select placeholder="请选择HTML类型">
                {Object.entries(HtmlType).map(([key, value]) => (
                  <Select.Option key={key} value={value}>
                    {key} ({value})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return record.htmlType || '-';
      }
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      width: 150,
      render: (_: any, record: CodeGeneratorColumn) => {
        if (record.id === editingKey) {
          return (
            <Form.Item name="dictType" style={{ margin: 0 }}>
              <DictionaryTypeSelect placeholder="请选择字典类型" allowClear style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return record.dictType || '-';
      }
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 120,
      render: (_: any, record: CodeGeneratorColumn) => {
        const isEditing = record.id === editingKey;
        return isEditing ? (
          <Space size="small">
            <Button type="link" onClick={handleSave}>
              保存
            </Button>
            <Button type="link" onClick={handleCancel}>
              取消
            </Button>
          </Space>
        ) : (
          <Button type="link" disabled={editingKey !== null} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        );
      }
    }
  ];

  return (
    <Drawer
      title="配置生成字段信息"
      placement="right"
      width={1800}
      onClose={onClose}
      open={visible}
      destroyOnClose
      extra={
        <Space>
          <Button type="primary" icon={<SyncOutlined />} onClick={handleSync} loading={loading}>
            同步表结构
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <Divider orientation="left">字段配置说明</Divider>
          <p>1. 主键和自增字段无法修改，系统会根据数据库表结构自动判断。</p>
          <p>2. 编辑各个字段的生成规则，可以选择是否在表单、列表、查询等场景下展示。</p>
          <p>3. 可以为字段指定查询方式、HTML类型和字典类型，影响代码生成的结果。</p>
        </div>

        <Form form={form} component={false}>
          <Table rowKey="id" columns={tableColumns} dataSource={data} pagination={false} scroll={{ x: 1500, y: 500 }} bordered />
        </Form>
      </Spin>
    </Drawer>
  );
};

export default ColumnConfigPanel;
