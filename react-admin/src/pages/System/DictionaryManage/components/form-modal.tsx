import React, { useEffect, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { Dictionary } from '@/types/dictionary';
import { createDictionary, updateDictionary } from '@/api/dictionary';
import { message } from '@/hooks/useMessage';

interface FormModalProps {
  open: boolean;
  title: string;
  initialValues?: Dictionary | null;
  isEdit: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  initialValues,
  isEdit,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 当initialValues变化时，重置表单字段值
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ description: '' });
      }
    }
  }, [form, initialValues, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEdit && initialValues?.id) {
        await updateDictionary({
          ...values,
          id: initialValues.id,
        });
        message.success('字典更新成功');
      } else {
        await createDictionary(values);
        message.success('字典创建成功');
      }
      
      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
      console.error('表单提交错误:', error);
    }
  };

  // 表单项配置
  const formItems = [
    {
      name: 'name',
      label: '字典名称',
      rules: [{ required: true, message: '请输入字典名称' }],
      component: (
        <Input placeholder="请输入字典名称" maxLength={50} />
      )
    },
    {
      name: 'code',
      label: '字典编码',
      rules: [
        { required: true, message: '请输入字典编码' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '编码只能包含字母、数字和下划线' }
      ],
      component: (
        <Input 
          placeholder="请输入字典编码(字母、数字和下划线)" 
          maxLength={50} 
          disabled={isEdit} 
        />
      )
    },
    {
      name: 'description',
      label: '字典描述',
      component: (
        <Input.TextArea 
          rows={4} 
          placeholder="请输入字典描述" 
          maxLength={200}
          showCount
        />
      )
    }
  ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ description: '' }}
      >
        {initialValues?.id && (
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
        )}
        
        {formItems.map(item => (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={item.rules}
          >
            {item.component}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default FormModal;
