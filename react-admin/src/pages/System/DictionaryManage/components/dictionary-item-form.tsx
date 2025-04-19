import React from 'react';
import { Form, Input, InputNumber, Button, Space, Select } from 'antd';
import { DictionaryItem } from '@/types/dictionary';
import ColorSelector from './color-selector';
import { useDictionary } from '@/hooks/useDictionaryBack';

interface DictionaryItemFormProps {
  dictionaryId: number;
  initialValues?: DictionaryItem | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DictionaryItemForm: React.FC<DictionaryItemFormProps> = ({ dictionaryId, initialValues, onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const isEditMode = !!initialValues;

  const { selectOptions: statusSelectOptions } = useDictionary('sys_common_status');

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.setFieldsValue({
        dictionaryId,
        label: '',
        value: '',
        code: '',
        sort: 1,
        status: '1',
        color: ''
      });
    }
  }, [form, initialValues, dictionaryId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, dictionaryId });
    } catch (error) {
      console.error('表单校验失败:', error);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ sort: 1, status: '1', color: '' }}>
      <Form.Item name="dictionaryId" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="label" label="标签" rules={[{ required: true, message: '请输入标签' }]}>
        <Input placeholder="请输入标签" maxLength={50} />
      </Form.Item>

      <Form.Item name="value" label="值" rules={[{ required: true, message: '请输入值' }]}>
        <Input placeholder="请输入值" maxLength={100} />
      </Form.Item>

      <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
        <Input
          placeholder="请输入编码"
          maxLength={100}
          disabled={isEditMode} // 编辑模式时禁用编码输入
        />
      </Form.Item>

      <Form.Item name="sort" label="排序">
        <InputNumber min={0} placeholder="请输入排序" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
        <Select options={statusSelectOptions} />
      </Form.Item>

      <Form.Item name="color" label="颜色">
        <ColorSelector />
      </Form.Item>

      <Form.Item>
        <Space className="w-full justify-end">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            确定
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DictionaryItemForm;
