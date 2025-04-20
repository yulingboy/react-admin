import React from 'react';
import { Button, Tag, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Notification } from '@/types/notification';
import { useDictionary } from '@/hooks/useDictionaryBack';
import { message, modal } from '@/hooks/useMessage';

interface ColumnsProps {
  handleEdit: (record: Notification) => void;
  handleDelete: (id: number) => void;
}

export const getTableColumns = ({ handleEdit, handleDelete }: ColumnsProps): ProColumns<Notification>[] => {
  // 使用hook获取通知类型字典数据
  const { valueEnum: typeValueEnum, labelMap: typeLabelMap } = useDictionary('sys_notice_type');

  // 处理删除操作，增加二次确认
  const confirmDelete = (record: Notification) => {
    modal.confirm({
      title: '确定要删除该通知吗？',
      content: `删除后将无法恢复，确定要删除 "${record.title}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDelete(record.id);
        message.success('删除成功');
      }
    });
  };

  return [
    {
      title: '关键字',
      dataIndex: 'keyword',
      hideInTable: true
    },
    {
      title: '通知标题',
      dataIndex: 'title',
      ellipsis: true,
      width: 200
    },
    {
      title: '通知内容',
      dataIndex: 'content',
      ellipsis: true,
      hideInSearch: true
    },
    {
      title: '通知类型',
      dataIndex: 'type',
      align: 'center',
      valueType: 'select',
      valueEnum: typeValueEnum,
      width: 120,
      render: (_, record) => {
        const type = record.type;
        const label = typeLabelMap[type]?.label || '未知类型';
        const color = typeLabelMap[type]?.color || 'default';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
      width: 160
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
      width: 160
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)}>
          删除
        </Button>
      ]
    }
  ];
};