import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { ConfigFormData } from '@/types/config';
import { createConfig, updateConfig } from '@/api/config';
import { useDictionary } from '@/hooks/useDictionaryBack';
import { message } from '@/hooks/useMessage';

const { Option } = Select;
const { TextArea } = Input;

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: ConfigFormData;
  isEdit?: boolean;
  groupOptions: string[];
}

const FormModal: React.FC<FormModalProps> = ({ 
  open, 
  onCancel, 
  onSuccess, 
  initialValues, 
  isEdit = false,
  groupOptions
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 使用hook获取状态字典数据
  const { selectOptions: statusOptions } = useDictionary('sys_common_status');
  
  // 可用的配置类型
  const typeOptions = [
    { label: '字符串', value: 'string' },
    { label: '数字', value: 'number' },
    { label: '布尔值', value: 'boolean' },
    { label: 'JSON', value: 'json' }
  ];

  // 设置表单初始值
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          status: '1',
          isSystem: '0',
          type: 'string',
          sort: 0
        });
      }
    }
  }, [form, initialValues, open]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit && initialValues?.id) {
        await updateConfig({
          ...values,
          id: initialValues.id
        });
        message.success('配置更新成功');
      } else {
        await createConfig(values);
        message.success('配置创建成功');
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
      title={isEdit ? '编辑配置' : '新增配置'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
      width={600}
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ status: '1', type: 'string', sort: 0 }}
      >
        <Form.Item
          name="key"
          label="配置键名"
          rules={[
            { required: true, message: '请输入配置键名' },
            { pattern: /^[a-zA-Z0-9_.]+$/, message: '配置键名只能包含字母、数字、下划线和点' }
          ]}
        >
          <Input 
            placeholder="请输入配置键名，如 site.name, app.version" 
            maxLength={50}
            disabled={isEdit} // 编辑状态下不允许修改配置键名
          />
        </Form.Item>

        <Form.Item
          name="value"
          label="配置值"
          rules={[{ required: true, message: '请输入配置值' }]}
        >
          <TextArea 
            placeholder="请输入配置值" 
            rows={3} 
            showCount 
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="配置描述"
        >
          <TextArea 
            placeholder="请输入配置描述" 
            rows={2} 
            showCount 
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="配置类型"
          rules={[{ required: true, message: '请选择配置类型' }]}
        >
          <Select placeholder="请选择配置类型">
            {typeOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="group"
          label="配置分组"
        >
          <Select
            placeholder="请选择配置分组"
            allowClear
            showSearch
            dropdownRender={(menu) => (
              <div>
                {menu}
                <div style={{ padding: '8px' }}>
                  <Input.Group compact>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="输入新分组并按回车"
                      onPressEnter={(e) => {
                        const target = e.target as HTMLInputElement;
                        const value = target.value.trim();
                        if (value && !groupOptions.includes(value)) {
                          const newValue = [...groupOptions, value];
                          // 这里我们只在表单中设置该值，而不是持久化到后端
                          form.setFieldsValue({ group: value });
                          target.value = '';
                        }
                      }}
                    />
                  </Input.Group>
                </div>
              </div>
            )}
          >
            {groupOptions.map(group => (
              <Option key={group} value={group}>{group}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序值"
          rules={[{ required: true, message: '请输入排序值' }]}
        >
          <InputNumber
            min={0}
            max={9999}
            placeholder="请输入排序值，值越小越靠前"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;