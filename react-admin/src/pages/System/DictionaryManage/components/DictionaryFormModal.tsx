import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { Dictionary } from '@/types/dictionary';

interface DictionaryFormModalProps {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  record?: Dictionary | null;
}

const DictionaryFormModal: React.FC<DictionaryFormModalProps> = ({
  title,
  visible,
  onCancel,
  onSubmit,
  record,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!record;

  // 当record变化时，重置表单字段值
  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  }, [form, record, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('表单校验失败:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ description: '' }}
      >
        {record && (
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label="字典名称"
          rules={[{ required: true, message: '请输入字典名称' }]}
        >
          <Input placeholder="请输入字典名称" maxLength={50} />
        </Form.Item>
        <Form.Item
          name="code"
          label="字典编码"
          rules={[
            { required: true, message: '请输入字典编码' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '编码只能包含字母、数字和下划线' }
          ]}
        >
          <Input 
            placeholder="请输入字典编码(字母、数字和下划线)" 
            maxLength={50} 
            disabled={isEdit} 
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="字典描述"
        >
          <Input.TextArea rows={4} placeholder="请输入字典描述" maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DictionaryFormModal;