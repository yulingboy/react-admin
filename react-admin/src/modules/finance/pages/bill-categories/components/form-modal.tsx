import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Radio, InputNumber, Select, TreeSelect } from 'antd';
import { BillCategory, BillCategoryFormData } from '@/modules/finance/types';
import { getBillCategoryTree } from '@/modules/finance/api';

// 表单弹窗属性
interface FormModalProps {
  visible: boolean;
  loading: boolean;
  values: Partial<BillCategory> & { categoryType?: string };
  onSubmit: (values: BillCategoryFormData) => void;
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
  const categoryType = values.categoryType || 'income';
  const [categoryTreeData, setCategoryTreeData] = useState<any[]>([]);

  // 加载分类树形数据
  useEffect(() => {
    const loadCategoryTree = async () => {
      if (visible && categoryType) {
        try {
          const data = await getBillCategoryTree(categoryType);
          // 转换为树形结构数据
          const treeData = formatTreeData(data);
          setCategoryTreeData(treeData);
        } catch (error) {
          console.error('加载分类树形数据失败', error);
        }
      }
    };

    loadCategoryTree();
  }, [visible, categoryType]);

  // 格式化树形数据
  const formatTreeData = (data: BillCategory[]) => {
    // 过滤出顶级分类
    const rootItems = data.filter(item => item.parentId === 0);
    
    // 添加禁用选项功能：禁止选择自己作为父分类以及自己的子分类
    const formatNode = (node: BillCategory) => {
      const children = data.filter(item => item.parentId === node.id);
      return {
        title: node.name,
        value: node.id,
        key: node.id,
        disabled: isEdit && (node.id === values.id || hasParent(data, node.id, values.id as number)),
        children: children.length > 0 ? children.map(formatNode) : undefined,
      };
    };
    
    // 格式化顶级分类
    return [
      {
        title: '顶级分类',
        value: 0,
        key: 0,
        children: rootItems.map(formatNode),
      },
    ];
  };

  // 判断一个节点是否为另一个节点的父节点
  const hasParent = (data: BillCategory[], nodeId: number, parentId: number): boolean => {
    const node = data.find(item => item.id === nodeId);
    if (!node) return false;
    if (node.parentId === parentId) return true;
    if (node.parentId === 0) return false;
    return hasParent(data, node.parentId, parentId);
  };

  // 在打开弹窗和values变更时重新设置表单值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...values,
        type: values.type || categoryType,
      });
    }
  }, [visible, values, form, categoryType]);

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
      title={isEdit ? '编辑账单分类' : '新增账单分类'}
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
        initialValues={{
          status: '1',
          isSystem: '0',
          parentId: 0,
          sort: 1,
          type: categoryType,
        }}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="type"
          label="分类类型"
          rules={[{ required: true, message: '请选择分类类型' }]}
        >
          <Radio.Group disabled={isEdit}>
            <Radio value="income">收入</Radio>
            <Radio value="expense">支出</Radio>
            <Radio value="transfer">转账</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="parentId"
          label="父级分类"
          rules={[{ required: true, message: '请选择父级分类' }]}
        >
          <TreeSelect
            placeholder="请选择父级分类"
            treeData={categoryTreeData}
            treeDefaultExpandAll
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="icon"
          label="图标类名"
          tooltip="使用图标库的类名，如 fa fa-bank"
        >
          <Input placeholder="请输入图标类名" />
        </Form.Item>

        <Form.Item
          name="color"
          label="分类颜色"
        >
          <Input type="color" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序值"
          tooltip="值越小，排序越靠前"
          rules={[{ required: true, message: '请输入排序值' }]}
        >
          <InputNumber min={1} max={999} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value="1">启用</Radio>
            <Radio value="0">禁用</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="isSystem"
          label="是否系统内置"
          rules={[{ required: true, message: '请选择是否系统内置' }]}
        >
          <Radio.Group disabled={isEdit}>
            <Radio value="1">是</Radio>
            <Radio value="0">否</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;