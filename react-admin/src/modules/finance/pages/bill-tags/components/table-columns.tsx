import React from 'react';
import { Tag, Button } from 'antd';
import { BillTag } from '@/modules/finance/types';
import { ProColumns } from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 操作列属性
 */
interface OperationColumnProps {
  handleEditBillTag: (record: BillTag) => void;
  handleDeleteBillTag: (id: number) => void;
}

/**
 * 获取账单标签表格列配置
 * @param props 操作列属性
 * @returns 列配置
 */
export const getBillTagColumns = (props: OperationColumnProps): ProColumns<BillTag>[] => {
  const { handleEditBillTag, handleDeleteBillTag } = props;

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      width: 150,
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
      title: '使用次数',
      dataIndex: 'useCount',
      width: 100,
      search: false,
    },
    {
      title: '标签示例',
      dataIndex: 'name',
      width: 120,
      search: false,
      render: (_, record) => (
        <Tag
          color={record.color || '#108ee9'}
          style={{ margin: 0 }}
        >
          {record.name}
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
      title: '更新时间',
      dataIndex: 'updatedAt',
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
          onClick={() => handleEditBillTag(record)}
          title="编辑"
        />,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteBillTag(record.id)}
          title="删除"
          disabled={record.useCount > 0}
        />,
      ],
    },
  ];
};