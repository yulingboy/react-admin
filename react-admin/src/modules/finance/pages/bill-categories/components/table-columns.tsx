import React from 'react';
import { Space, Tag, Button } from 'antd';
import { BillCategory } from '@/modules/finance/types';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 操作列属性
 */
interface OperationColumnProps {
  handleEditBillCategory: (record: BillCategory) => void;
  handleDeleteBillCategory: (id: number) => void;
}

/**
 * 获取账单分类表格列配置
 * @param props 操作列属性
 * @returns 列配置
 */
export const getBillCategoryColumns = (props: OperationColumnProps): ProColumns<BillCategory>[] => {
  const { handleEditBillCategory, handleDeleteBillCategory } = props;

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '父分类',
      dataIndex: ['parent', 'name'],
      width: 130,
      search: false,
      render: (_, record) => (record.parent?.name || '顶级分类'),
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      search: false,
      render: (_, record) => (record.icon ? <span className="flex items-center"><i className={record.icon} /></span> : '-'),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      width: 80,
      search: false,
      render: (_, record) => (
        record.color ? (
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: record.color,
            }}
          />
        ) : '-'
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
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
      title: '系统内置',
      dataIndex: 'isSystem',
      width: 100,
      valueEnum: {
        '0': { text: '否' },
        '1': { text: '是' },
      },
      render: (_, record) => (
        <Tag color={record.isSystem === '1' ? 'blue' : 'default'}>
          {record.isSystem === '1' ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '账单数',
      dataIndex: 'billCount',
      width: 80,
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
          onClick={() => handleEditBillCategory(record)}
          title="编辑"
          disabled={record.isSystem === '1'}
        />,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteBillCategory(record.id)}
          title="删除"
          disabled={record.isSystem === '1' || (record.billCount && record.billCount > 0)}
        />,
      ],
    },
  ];
};