import React from 'react';
import { Space, Tag, Button } from 'antd';
import { Account } from '@/modules/finance/types';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons';

/**
 * 操作列属性
 */
interface OperationColumnProps {
  handleEditAccount: (record: Account) => void;
  handleDeleteAccount: (id: number) => void;
  handleAdjustBalance: (record: Account) => void;
}

/**
 * 获取账户表格列配置
 * @param props 操作列属性
 * @returns 列配置
 */
export const getAccountColumns = (props: OperationColumnProps): ProColumns<Account>[] => {
  const { handleEditAccount, handleDeleteAccount, handleAdjustBalance } = props;

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '账户名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '账户类型',
      dataIndex: ['type', 'name'],
      width: 120,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        allowClear: true,
      },
      request: async () => {
        // 此处实际上是从后端获取账户类型选项，这里为了示例简化处理
        return [
          { label: '现金账户', value: 1 },
          { label: '银行卡', value: 2 },
          { label: '信用卡', value: 3 },
          { label: '支付宝', value: 4 },
          { label: '微信钱包', value: 5 },
        ];
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      width: 120,
      search: false,
      render: (val) => {
        // 确保 val 是数字类型才调用 toFixed
        if (val === null || val === undefined) return '￥0.00';
        
        let numVal;
        try {
          // 尝试转换为数字
          numVal = typeof val === 'number' ? val : 
                  typeof val === 'string' ? parseFloat(val) : 
                  typeof val === 'object' && val.toString ? parseFloat(val.toString()) : 0;
          
          // 检查是否是有效数字
          if (isNaN(numVal)) return '￥0.00';
          
          return `￥${numVal.toFixed(2)}`;
        } catch (error) {
          console.error('余额格式化错误:', error, val);
          return '￥0.00';
        }
      },
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      search: false,
      render: (_, record) => (record.icon ? <span className="flex items-center"><i className={record.icon} /></span> : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        '0': { text: '禁用', status: 'Error' },
        '1': { text: '启用', status: 'Success' },
      },
      render: (_, record) => (
        <Tag color={record.status === '1' ? 'success' : 'error'}>
          {record.status === '1' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '默认账户',
      dataIndex: 'isDefault',
      width: 120,
      valueEnum: {
        '0': { text: '否' },
        '1': { text: '是' },
      },
      render: (_, record) => (
        <Tag color={record.isDefault === '1' ? 'blue' : 'default'}>
          {record.isDefault === '1' ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <Button
          key="adjust"
          type="link"
          size="small"
          icon={<CalculatorOutlined />}
          onClick={() => handleAdjustBalance(record)}
          title="调整余额"
        >
          调整余额
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditAccount(record)}
          title="编辑"
        />,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteAccount(record.id)}
          title="删除"
          disabled={record.isDefault === '1'}
        />,
      ],
    },
  ];
};