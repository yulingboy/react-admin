import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Radio, InputNumber, Select, DatePicker, TreeSelect, Space, Tag } from 'antd';
import { Bill, BillFormData } from '@/modules/finance/types';
import { 
  getAccountOptions, 
  getBillCategoryTree, 
  getBillTagOptions 
} from '@/modules/finance/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

// 表单弹窗属性
interface FormModalProps {
  visible: boolean;
  loading: boolean;
  values: Partial<Bill> & { billType?: string };
  onSubmit: (values: BillFormData) => void;
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
  const billType = values.billType || values.type || 'expense';
  
  // 选项数据
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [tagOptions, setTagOptions] = useState<any[]>([]);

  // 加载选项数据
  useEffect(() => {
    const loadOptions = async () => {
      if (visible) {
        try {
          // 加载账户选项
          const accountsData = await getAccountOptions();
          const accountOpts = accountsData.map(item => ({
            label: item.name,
            value: item.id,
            icon: item.icon,
            disabled: item.status === '0'
          }));
          setAccountOptions(accountOpts);

          // 加载分类树
          if (billType) {
            const categoriesData = await getBillCategoryTree(billType);
            // 转换为树形结构
            const treeData = formatCategoryTree(categoriesData);
            setCategoryTree(treeData);
          }

          // 加载标签选项
          const tagsData = await getBillTagOptions();
          const tagOpts = tagsData.map(item => ({
            label: item.name,
            value: item.id,
            color: item.color
          }));
          setTagOptions(tagOpts);
        } catch (error) {
          console.error('加载选项数据失败', error);
        }
      }
    };

    loadOptions();
  }, [visible, billType]);

  // 格式化分类树
  const formatCategoryTree = (data: any[]) => {
    // 过滤出顶级分类
    const rootItems = data.filter(item => item.parentId === 0);
    
    // 递归格式化节点
    const formatNode = (node: any) => {
      const children = data.filter(item => item.parentId === node.id);
      return {
        title: node.name,
        value: node.id,
        key: node.id,
        icon: node.icon,
        color: node.color,
        children: children.length > 0 ? children.map(formatNode) : undefined,
      };
    };
    
    return rootItems.map(formatNode);
  };

  // 在打开弹窗和values变更时重新设置表单值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...values,
        billDate: values.billDate ? dayjs(values.billDate) : dayjs(),
        tagIds: values.tags?.map(tag => tag.id) || [],
        type: values.type || billType,
      });
    }
  }, [visible, values, form, billType]);

  // 处理账单类型变更
  const handleBillTypeChange = async (type: string) => {
    try {
      // 切换类型时，重置分类
      form.setFieldValue('categoryId', undefined);
      
      // 重新加载对应类型的分类
      const categoriesData = await getBillCategoryTree(type);
      const treeData = formatCategoryTree(categoriesData);
      setCategoryTree(treeData);
    } catch (error) {
      console.error('加载分类树失败', error);
    }
  };

  // 自定义标签渲染
  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const tag = tagOptions.find(t => t.value === value);
    return (
      <Tag
        color={tag?.color || '#108ee9'}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const data = await form.validateFields();
      // 处理日期
      const formattedData = {
        ...data,
        billDate: data.billDate.format('YYYY-MM-DD'),
      };
      onSubmit(formattedData);
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
      title={isEdit ? '编辑账单' : '新增账单'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose={true}
      maskClosable={false}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: billType,
          billDate: dayjs(),
          amount: 0,
        }}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="账单类型"
          rules={[{ required: true, message: '请选择账单类型' }]}
        >
          <Radio.Group onChange={(e) => handleBillTypeChange(e.target.value)}>
            <Radio value="expense">支出</Radio>
            <Radio value="income">收入</Radio>
            <Radio value="transfer">转账</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="billDate"
          label="账单日期"
          rules={[{ required: true, message: '请选择账单日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="金额"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入金额"
            precision={2}
            step={10}
            min={0}
            formatter={(value) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/￥\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="accountId"
          label={form.getFieldValue('type') === 'transfer' ? '转出账户' : '账户'}
          rules={[{ required: true, message: '请选择账户' }]}
        >
          <Select
            placeholder="请选择账户"
            options={accountOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        {form.getFieldValue('type') === 'transfer' && (
          <Form.Item
            name="targetAccountId"
            label="转入账户"
            rules={[
              { required: true, message: '请选择转入账户' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('accountId') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('转出账户和转入账户不能相同'));
                },
              }),
            ]}
          >
            <Select
              placeholder="请选择转入账户"
              options={accountOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}

        {form.getFieldValue('type') !== 'transfer' && (
          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <TreeSelect
              placeholder="请选择分类"
              treeData={categoryTree}
              showSearch
              allowClear
              treeNodeFilterProp="title"
            />
          </Form.Item>
        )}

        <Form.Item
          name="tagIds"
          label="标签"
        >
          <Select
            mode="multiple"
            placeholder="请选择标签"
            options={tagOptions}
            allowClear
            showSearch
            optionFilterProp="label"
            tagRender={tagRender}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={3} placeholder="请输入账单描述" maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;