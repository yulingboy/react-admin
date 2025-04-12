import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { UserFormData } from '@/types/user';
import { createUser, updateUser } from '@/api/user';
import DictionarySelect from '@/components/Dictionary/DictionarySelect';

interface UserFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: UserFormData;
  isEdit?: boolean;
  roleOptions: { label: string; value: number }[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialValues,
  isEdit = false,
  roleOptions
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 设置表单初始值
  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ status: '1' }); // 默认启用
      }
    }
  }, [form, initialValues, visible]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEdit && initialValues?.id) {
        await updateUser({
          ...values,
          id: initialValues.id
        });
        message.success('用户更新成功');
      } else {
        await createUser(values);
        message.success('用户创建成功');
      }
      
      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
      console.error('表单提交错误:', error);
    }
  };

  const formItems = [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' }
      ],
      component: (
        <Input 
          prefix={<UserOutlined />}
          placeholder="请输入用户名" 
          disabled={isEdit}
        />
      )
    },
    {
      name: 'email',
      label: '电子邮箱',
      rules: [
        { required: true, message: '请输入电子邮箱' },
        { type: 'email', message: '请输入有效的电子邮箱' },
        { max: 50, message: '电子邮箱最大长度为50个字符' }
      ],
      component: (
        <Input 
          prefix={<MailOutlined />}
          placeholder="请输入电子邮箱" 
        />
      )
    },
    {
      name: 'status',
      label: '用户状态',
      rules: [{ required: true, message: '请选择用户状态' }],
      component: (
        <DictionarySelect
          code="sys_common_status"
          placeholder="请选择用户状态"
        />
      )
    },
    {
      name: 'roleId',
      label: '用户角色',
      rules: [{ required: true, message: '请选择用户角色' }],
      component: (
        <Select
          placeholder="请选择用户角色"
          options={roleOptions}
        />
      )
    }
  ];

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: '1' }} // 默认启用
      >
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

export default UserFormModal;