import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { NotificationFormData } from '@/modules/system/types/notification';
import useDictionary from '@/hooks/useDictionaryBack';
import { message } from '@/hooks/useMessage';
import { createNotification, updateNotification } from '@/modules/system/api/notification-api';

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: NotificationFormData;
  isEdit?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({ open, onCancel, onSuccess, initialValues, isEdit = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // 使用hook获取通知类型字典数据
  const { selectOptions: typeSelectOptions } = useDictionary('sys_notice_type');

  // 设置表单初始值
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [form, initialValues, open]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit && initialValues?.id) {
        await updateNotification({
          ...values,
          id: initialValues.id
        });
        message.success('通知更新成功');
      } else {
        await createNotification(values);
        message.success('通知创建成功');
      }

      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
      console.error('表单提交错误:', error);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑通知' : '新增通知'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
      width={520}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="通知标题"
          rules={[{ required: true, message: '请输入通知标题' }]}
        >
          <Input placeholder="请输入通知标题" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="type"
          label="通知类型"
          rules={[{ required: true, message: '请选择通知类型' }]}
        >
          <Select options={typeSelectOptions} placeholder="请选择通知类型" />
        </Form.Item>

        <Form.Item
          name="content"
          label="通知内容"
          rules={[{ required: true, message: '请输入通知内容' }]}
        >
          <Input.TextArea placeholder="请输入通知内容" rows={5} maxLength={2000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;