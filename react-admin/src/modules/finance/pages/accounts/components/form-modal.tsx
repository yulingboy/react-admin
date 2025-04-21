import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Radio, InputNumber, Select, ColorPicker } from 'antd';
import { Account, AccountFormData } from '@/modules/finance/types';
import { getAccountTypeOptions } from '@/modules/finance/api';

// 表单弹窗属性
interface FormModalProps {
  visible: boolean;
  loading: boolean;
  values: Partial<Account>;
  onSubmit: (values: AccountFormData) => void;
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
  const [accountTypeOptions, setAccountTypeOptions] = useState<{ label: string; value: number }[]>([]);

  // 加载账户类型选项
  useEffect(() => {
    const loadAccountTypeOptions = async () => {
      try {
        const data = await getAccountTypeOptions();
        const options = data.map(item => ({
          label: item.name,
          value: item.id
        }));
        setAccountTypeOptions(options);
      } catch (error) {
        console.error('加载账户类型选项失败', error);
      }
    };

    loadAccountTypeOptions();
  }, []);

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
      title={isEdit ? '编辑账户' : '新增账户'}
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
          isDefault: '0',
          balance: 0,
          sort: 1,
        }}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="账户名称"
          rules={[{ required: true, message: '请输入账户名称' }]}
        >
          <Input placeholder="请输入账户名称" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="typeId"
          label="账户类型"
          rules={[{ required: true, message: '请选择账户类型' }]}
        >
          <Select
            placeholder="请选择账户类型"
            options={accountTypeOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="balance"
          label="账户余额"
          rules={[{ required: true, message: '请输入账户余额' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入账户余额"
            precision={2}
            step={100}
            min={0}
            formatter={(value) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/￥\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="icon"
          label="图标类名"
          tooltip="使用图标库的类名，如 fa fa-bank"
        >
          <Input placeholder="请输入图标类名" />
        </Form.Item>

        <Form.Item
          name="color"
          label="账户颜色"
        >
          <Input type="color" style={{ width: '100%' }} />
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
          name="isDefault"
          label="是否默认账户"
          rules={[{ required: true, message: '请选择是否默认账户' }]}
        >
          <Radio.Group>
            <Radio value="1">是</Radio>
            <Radio value="0">否</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;