import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select } from 'antd';
import { Budget } from '@/modules/finance/types';
import { useCategories } from '@/modules/finance/hooks/use-categories';
import dayjs from 'dayjs';

interface FormModalProps {
  visible: boolean;
  confirmLoading: boolean;
  budget: Budget | null;
  onSubmit: (values: Partial<Budget>) => void;
  onCancel: () => void;
}

/**
 * 预算表单模态框组件
 * 用于新增和编辑预算信息
 */
const FormModal: React.FC<FormModalProps> = ({
  visible,
  confirmLoading,
  budget,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  
  // 获取账单分类列表
  const { categories, loading: categoriesLoading } = useCategories();

  // 当前编辑的预算改变时，重置表单字段
  useEffect(() => {
    if (visible) {
      form.resetFields();
      
      if (budget) {
        // 编辑模式：填充表单数据
        const formData = {
          ...budget,
          // 转换日期字段为dayjs对象
          startDate: budget.startDate ? dayjs(budget.startDate) : undefined,
          endDate: budget.endDate ? dayjs(budget.endDate) : undefined
        };
        form.setFieldsValue(formData);
      }
    }
  }, [visible, budget, form]);

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 将dayjs对象转换回字符串
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined
      };
      
      onSubmit(formattedValues);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={budget ? '编辑预算' : '新增预算'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'monthly',
          amount: 0,
          usedAmount: 0
        }}
      >
        <Form.Item
          name="name"
          label="预算名称"
          rules={[{ required: true, message: '请输入预算名称' }]}
        >
          <Input placeholder="请输入预算名称" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="type"
          label="预算类型"
          rules={[{ required: true, message: '请选择预算类型' }]}
        >
          <Select>
            <Select.Option value="monthly">月度预算</Select.Option>
            <Select.Option value="yearly">年度预算</Select.Option>
            <Select.Option value="custom">自定义预算</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="预算金额"
          rules={[{ required: true, message: '请输入预算金额' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={100}
            precision={2}
            addonBefore="¥"
            placeholder="请输入预算金额"
          />
        </Form.Item>

        {budget && (
          <Form.Item
            name="usedAmount"
            label="已使用金额"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={100}
              precision={2}
              addonBefore="¥"
              placeholder="已使用金额"
              disabled
            />
          </Form.Item>
        )}

        <Form.Item
          name="categoryId"
          label="关联分类"
        >
          <Select
            placeholder="请选择关联分类"
            loading={categoriesLoading}
            allowClear
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="开始日期"
          rules={[{ required: true, message: '请选择开始日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="结束日期"
          rules={[{ required: true, message: '请选择结束日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="备注说明"
        >
          <Input.TextArea rows={3} placeholder="请输入备注说明" maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;