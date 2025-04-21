import React, { useEffect, useState } from 'react';
import { Drawer, Form, Button, DatePicker, Select, InputNumber, Space, Tag, Row, Col } from 'antd';
import { AdvancedFilterValues } from '@/modules/finance/types';
import { getAccountOptions, getBillCategoryOptions, getBillTagOptions } from '@/modules/finance/api';

const { RangePicker } = DatePicker;

// 高级筛选抽屉属性
interface AdvancedFilterDrawerProps {
  visible: boolean;
  initialValues: AdvancedFilterValues;
  onSubmit: (values: AdvancedFilterValues) => void;
  onClose: () => void;
  onOpen: () => void;
}

const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  visible,
  initialValues,
  onSubmit,
  onClose,
  onOpen,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<{ label: string; value: number }[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [tags, setTags] = useState<{ label: string; value: number; color?: string }[]>([]);

  // 加载选项数据
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // 加载账户选项
        const accountsData = await getAccountOptions();
        setAccounts(accountsData.map(item => ({
          label: item.name,
          value: item.id
        })));

        // 加载分类选项
        const categoriesData = await getBillCategoryOptions();
        setCategories(categoriesData.map(item => ({
          label: item.parent ? `${item.parent.name} > ${item.name}` : item.name,
          value: item.id
        })));

        // 加载标签选项
        const tagsData = await getBillTagOptions();
        setTags(tagsData.map(item => ({
          label: item.name,
          value: item.id,
          color: item.color
        })));
      } catch (error) {
        console.error('加载筛选选项失败', error);
      }
    };

    if (visible) {
      loadOptions();
    }
  }, [visible]);

  // 在打开抽屉和initialValues变更时重新设置表单值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [initialValues.startDate, initialValues.endDate]
          : undefined,
      });
    }
  }, [visible, initialValues, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 处理日期范围
      const { dateRange, ...rest } = values;
      const result = {
        ...rest,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      };
      
      onSubmit(result);
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
  };

  // 自定义标签渲染
  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const tag = tags.find(t => t.value === value);
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

  return (
    <Drawer
      title="高级筛选"
      width={480}
      onClose={onClose}
      open={visible}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              应用筛选
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="dateRange"
          label="日期范围"
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="accountIds"
          label="账户"
        >
          <Select
            mode="multiple"
            placeholder="请选择账户"
            options={accounts}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="categoryIds"
          label="分类"
        >
          <Select
            mode="multiple"
            placeholder="请选择分类"
            options={categories}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="tagIds"
          label="标签"
        >
          <Select
            mode="multiple"
            placeholder="请选择标签"
            options={tags}
            allowClear
            showSearch
            optionFilterProp="label"
            tagRender={tagRender}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minAmount"
              label="最小金额"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="最小金额"
                precision={2}
                min={0}
                formatter={(value) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/￥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxAmount"
              label="最大金额"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="最大金额"
                precision={2}
                min={0}
                formatter={(value) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/￥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="keyword"
          label="关键词搜索"
        >
          <Select
            mode="tags"
            placeholder="输入关键词，回车确认"
            allowClear
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AdvancedFilterDrawer;