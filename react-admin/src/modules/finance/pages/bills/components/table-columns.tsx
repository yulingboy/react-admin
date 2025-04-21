import React from 'react';
import { Tag, Button, Space, Tooltip } from 'antd';
import { Bill } from '@/modules/finance/types';
import { ProColumns } from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 操作列属性
 */
interface OperationColumnProps {
  handleEditBill: (record: Bill) => void;
  handleDeleteBill: (id: number) => void;
}

/**
 * 获取账单表格列配置
 * @param props 操作列属性
 * @returns 列配置
 */
export const getBillColumns = (props: OperationColumnProps): ProColumns<Bill>[] => {
  const { handleEditBill, handleDeleteBill } = props;

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '账单类型',
      dataIndex: 'type',
      width: 100,
      valueEnum: {
        income: { text: '收入', status: 'Success' },
        expense: { text: '支出', status: 'Error' },
        transfer: { text: '转账', status: 'Processing' },
      },
      render: (_, record) => {
        const typeMap = {
          income: { text: '收入', color: 'success' },
          expense: { text: '支出', color: 'error' },
          transfer: { text: '转账', color: 'processing' },
        };
        return (
          <Tag color={typeMap[record.type].color}>
            {typeMap[record.type].text}
          </Tag>
        );
      },
    },
    {
      title: '账单日期',
      dataIndex: 'billDate',
      width: 120,
      valueType: 'date',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      search: false,
      render: (_, record) => {
        const color = record.type === 'income' ? '#52c41a' : record.type === 'expense' ? '#f5222d' : '#1890ff';
        const prefix = record.type === 'income' ? '+' : record.type === 'expense' ? '-' : '';
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {prefix}￥{record.amount.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        if (!record.category) return '-';
        
        // 如果有父分类，显示父分类 > 子分类
        const categoryName = record.category.parent 
          ? `${record.category.parent.name} > ${record.category.name}`
          : record.category.name;
          
        return (
          <Tooltip title={categoryName}>
            <span>
              {record.category.icon && <i className={record.category.icon} style={{ marginRight: '4px' }} />}
              {categoryName}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '账户',
      dataIndex: ['account', 'name'],
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        if (!record.account) return '-';
        return (
          <Tooltip title={record.account.name}>
            <span>
              {record.account.icon && <i className={record.account.icon} style={{ marginRight: '4px' }} />}
              {record.account.name}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '目标账户',
      dataIndex: ['targetAccount', 'name'],
      width: 120,
      ellipsis: true,
      search: false,
      hideInTable: true, // 默认隐藏，只在转账类型下显示
      render: (_, record) => {
        if (!record.targetAccount) return '-';
        return (
          <Tooltip title={record.targetAccount.name}>
            <span>
              {record.targetAccount.icon && <i className={record.targetAccount.icon} style={{ marginRight: '4px' }} />}
              {record.targetAccount.name}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      search: false,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.tags && record.tags.length > 0 ? 
            record.tags.map(tag => (
              <Tag key={tag.id} color={tag.color || '#108ee9'}>
                {tag.name}
              </Tag>
            )) 
            : '-'
          }
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      search: false,
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
      width: 120,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditBill(record)}
          title="编辑"
        />,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteBill(record.id)}
          title="删除"
        />,
      ],
    },
  ];
};