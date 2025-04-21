import React from 'react';
import { Space, Button, Popconfirm, Tag } from 'antd';
import { ProColumns } from '@ant-design/pro-components';
import { Budget } from '@/modules/finance/types';

interface BudgetColumnProps {
  handleEditBudget: (budget: Budget) => void;
  handleDeleteBudget: (id: number) => void;
}

/**
 * 获取预算管理表格列配置
 * @param props 列配置属性
 * @returns 表格列配置数组
 */
export const getBudgetColumns = (props: BudgetColumnProps): ProColumns<Budget>[] => {
  const { handleEditBudget, handleDeleteBudget } = props;

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
      width: 80,
    },
    {
      title: '预算名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '预算类型',
      dataIndex: 'type',
      valueEnum: {
        monthly: { text: '月度预算', status: 'Processing' },
        yearly: { text: '年度预算', status: 'Success' },
        custom: { text: '自定义预算', status: 'Warning' },
      },
    },
    {
      title: '预算金额',
      dataIndex: 'amount',
      search: false,
      render: (_, record) => (
        <span>¥{record.amount?.toFixed(2)}</span>
      ),
    },
    {
      title: '已使用金额',
      dataIndex: 'usedAmount',
      search: false,
      render: (_, record) => (
        <span>¥{record.usedAmount?.toFixed(2)}</span>
      ),
    },
    {
      title: '使用进度',
      dataIndex: 'progress',
      search: false,
      render: (_, record) => {
        const progress = record.amount ? (record.usedAmount / record.amount * 100).toFixed(2) : '0';
        let color = 'green';
        if (parseFloat(progress) > 80) color = 'orange';
        if (parseFloat(progress) >= 100) color = 'red';
        
        return <Tag color={color}>{progress}%</Tag>;
      },
    },
    {
      title: '关联分类',
      dataIndex: 'categoryName',
      ellipsis: true,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      valueType: 'date',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      valueType: 'date',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            onClick={() => handleEditBudget(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该预算吗？"
            onConfirm={() => handleDeleteBudget(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              type="link"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};