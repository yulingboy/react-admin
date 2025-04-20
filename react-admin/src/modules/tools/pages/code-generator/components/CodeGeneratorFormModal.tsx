import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Spin } from 'antd';
import { CodeGenerator, TableInfo } from '@/modules/tools/types/code-generator';

interface CodeGeneratorFormModalProps {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  record: CodeGenerator | null;
  tableList: TableInfo[];
  loadingTables: boolean;
}

const CodeGeneratorFormModal: React.FC<CodeGeneratorFormModalProps> = ({
  title,
  visible,
  onCancel,
  onSubmit,
  record,
  tableList = [], // 添加默认空数组
  loadingTables
}) => {
  const [form] = Form.useForm();
  const isEdit = !!record;

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          ...record,
          options: record.options
            ? JSON.parse(record.options)
            : {
                generateApi: true,
                generateCrud: true,
                generateRoutes: true,
                generateTest: false
              }
        });
      } else {
        form.resetFields();
        // 设置默认值
        form.setFieldsValue({
          options: {
            generateApi: true,
            generateCrud: true,
            generateRoutes: true,
            generateTest: false
          }
        });
      }
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 处理options对象为字符串
      if (values.options) {
        values.options = JSON.stringify(values.options);
      }
      onSubmit(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 表名变化时自动填充一些字段
  const handleTableChange = (tableName: string) => {
    const selectedTable = tableList.find(t => t.tableName === tableName);
    if (selectedTable) {
      const moduleName = tableName.includes('_') ? tableName.split('_')[0] : tableName;

      const businessName = tableName.includes('_') ? tableName.substring(tableName.indexOf('_') + 1) : tableName;

      form.setFieldsValue({
        moduleName,
        businessName
      });
    }
  };

  return (
    <Modal title={title} open={visible} onCancel={onCancel} onOk={handleSubmit} width={800} destroyOnClose>
      <Spin spinning={loadingTables}>
        <Form form={form} layout="vertical">
          <Form.Item label="表名称" name="tableName" rules={[{ required: true, message: '请选择表名称' }]}>
            <Select
              placeholder="请选择表名称"
              showSearch
              optionFilterProp="children"
              onChange={handleTableChange}
              disabled={isEdit}
              options={(tableList || []).map(table => ({
                label: `${table.tableName}${table.tableComment ? ` (${table.tableComment})` : ''}`,
                value: table.tableName
              }))}
            />
          </Form.Item>

          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入生成器名称" />
          </Form.Item>

          <Form.Item label="模块名称" name="moduleName" rules={[{ required: true, message: '请输入模块名称' }]}>
            <Input placeholder="请输入模块名称" />
          </Form.Item>

          <Form.Item label="业务名称" name="businessName" rules={[{ required: true, message: '请输入业务名称' }]}>
            <Input placeholder="请输入业务名称" />
          </Form.Item>

          <Form.Item label="生成选项" name={['options', 'generateApi']} valuePropName="checked">
            <Select
              mode="multiple"
              placeholder="请选择生成选项"
              options={[
                { label: '生成API代码', value: 'generateApi' },
                { label: '生成CRUD代码', value: 'generateCrud' },
                { label: '生成路由代码', value: 'generateRoutes' },
                { label: '生成测试代码', value: 'generateTest' }
              ]}
            />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="请输入备注信息（可选）" rows={3} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CodeGeneratorFormModal;
