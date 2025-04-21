import React, { useEffect } from 'react';
import { Form, Input, Modal, Radio, InputNumber, Switch } from 'antd';
import { AccountType, AccountTypeFormData } from '@/modules/finance/types';

// 表单弹窗属性
interface FormModalProps {
  visible: boolean;
  loading: boolean;
  values: Partial<AccountType>;
  onSubmit: (values: AccountTypeFormData) => void;
  onCancel: () => void;
}

const FormModal: React.FC<FormModalProps> = ({
  visible,
  loading,
  values,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!values.id;

  // 在打开弹窗和values变更时重新设置表单值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...values,
      });
    }
  }, [visible, values, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const data = await form.validateFields();
      onSubmit(data);
    } catch (error) {
      // 表单验证失败
      console.error('表单验证失败:', error);
    }
  };

  // 表单取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? '编辑账户类型' : '新增账户类型'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose={true}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: '1',
          isSystem: '0',
          sort: 1,
        }}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="账户类型名称"
          rules={[{ required: true, message: '请输入账户类型名称' }]}
        >
          <Input placeholder="请输入账户类型名称" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="icon"
          label="图标类名"
          tooltip="使用图标库的类名，如 fa fa-bank"
        >
          <Input placeholder="请输入图标类名" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={3} placeholder="请输入账户类型描述" maxLength={200} />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序值"
          tooltip="值越小，排序越靠前"
          rules={[{ required: true, message: '请输入排序值' }]}
        >
          <InputNumber min={1} max={999} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value="1">启用</Radio>
            <Radio value="0">禁用</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="isSystem"
          label="是否系统内置"
          rules={[{ required: true, message: '请选择是否系统内置' }]}
        >
          <Radio.Group disabled={isEdit}>
            <Radio value="1">是</Radio>
            <Radio value="0">否</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;