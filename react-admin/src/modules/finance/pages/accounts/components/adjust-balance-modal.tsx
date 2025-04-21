import React, { useEffect } from 'react';
import { Form, Modal, InputNumber, Input } from 'antd';
import { Account, AdjustBalanceData } from '@/modules/finance/types';

// 余额调整弹窗属性
interface AdjustBalanceModalProps {
  visible: boolean;
  loading: boolean;
  account: Partial<Account>;
  onSubmit: (values: AdjustBalanceData) => void;
  onCancel: () => void;
}

const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  visible,
  loading,
  account,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // 在打开弹窗和account变更时重新设置表单值
  useEffect(() => {
    if (visible && account) {
      form.setFieldsValue({
        id: account.id,
        balance: account.balance,
      });
    }
  }, [visible, account, form]);

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
      title={`调整账户余额: ${account?.name || ''}`}
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
          name="reason"
          label="调整原因"
        >
          <Input.TextArea rows={3} placeholder="请输入调整原因" maxLength={200} />
        </Form.Item>

        <p className="text-gray-500 text-sm">注意: 调整余额不会自动创建账单记录，如有需要请手动添加收支记录。</p>
      </Form>
    </Modal>
  );
};

export default AdjustBalanceModal;