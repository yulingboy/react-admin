import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { RoleFormData } from '@/types/role';
import { createRole, updateRole } from '@/api/role';
import DictionarySelect from '@/components/Dictionary/DictionarySelect';

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: RoleFormData;
  isEdit?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialValues,
  isEdit = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 设置表单初始值
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ status: '1' });
      }
    }
  }, [form, initialValues, open]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEdit && initialValues?.id) {
        await updateRole({
          ...values,
          id: initialValues.id
        });
        message.success('角色更新成功');
      } else {
        await createRole(values);
        message.success('角色创建成功');
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
      label: '角色名称',
      rules: [{ required: true, message: '请输入角色名称' }],
      component: (
        <Input 
          placeholder="请输入角色名称" 
          maxLength={20} 
        />
      )
    },
    {
      name: 'key',
      label: '角色标识',
      rules: [
        { required: true, message: '请输入角色标识' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '角色标识只能包含字母、数字和下划线' }
      ],
      component: (
        <Input 
          placeholder="请输入角色标识，如 admin, editor" 
          maxLength={30} 
          disabled={isEdit} // 编辑状态下不允许修改角色标识
        />
      )
    },
    {
      name: 'description',
      label: '角色描述',
      component: (
        <Input.TextArea 
          placeholder="请输入角色描述" 
          rows={3} 
          maxLength={100} 
          showCount 
        />
      )
    },
    {
      name: 'status',
      label: '角色状态',
      rules: [{ required: true, message: '请选择角色状态' }],
      component: (
        <DictionarySelect
          code="sys_common_status"
          placeholder="请选择角色状态"
        />
      )
    }
  ];

  return (
    <Modal
      title={isEdit ? '编辑角色' : '新增角色'}
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
        initialValues={{ status: 1 }}
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

export default FormModal;