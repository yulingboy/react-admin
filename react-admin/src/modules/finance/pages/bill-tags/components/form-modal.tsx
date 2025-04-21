import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { BillTag, BillTagFormData } from '@/modules/finance/types';

// 表单弹窗属性
interface FormModalProps {
  visible: boolean;
  loading: boolean;
  values: Partial<BillTag>;
  onSubmit: (values: BillTagFormData) => void;
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
      title={isEdit ? '编辑账单标签' : '新增账单标签'}
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
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="标签名称"
          rules={[{ required: true, message: '请输入标签名称' }]}
        >
          <Input placeholder="请输入标签名称" maxLength={20} />
        </Form.Item>

        <Form.Item
          name="color"
          label="标签颜色"
        >
          <Input type="color" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="标签预览">
          <div className="flex items-center gap-2">
            <span>效果:</span>
            <div className="bg-gray-100 p-2 rounded">
              {form.getFieldValue('name') ? (
                <div
                  className="inline-block px-2 py-1 rounded"
                  style={{
                    backgroundColor: form.getFieldValue('color') || '#1890ff',
                    color: '#fff',
                  }}
                >
                  {form.getFieldValue('name')}
                </div>
              ) : (
                <span className="text-gray-400">请输入标签名称</span>
              )}
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;