import React, { useState } from 'react';
import { Button, Tag, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Role } from '@/types/role';
import { useDictionary } from '@/hooks/useDictionaryBack';
import { message, modal } from '@/hooks/useMessage';

interface ColumnsProps {
  handleEditRole: (record: Role) => void;
  handleDeleteRole: (id: number) => void;
}

export const getRoleColumns = ({ handleEditRole, handleDeleteRole }: ColumnsProps): ProColumns<Role>[] => {
  // 使用改进的 hook，获取字典数据
  const { valueEnum: statusEnum, labelMap: statusLabelMap } = useDictionary('sys_common_status');
  const { valueEnum: isSystemEnum, labelMap: isSystemLabelMap } = useDictionary('sys_is_system');

  // 处理删除操作，增加二次确认
  const confirmDelete = (record: Role) => {
    if (record.isSystem === '1') {
      message.warning('系统内置角色不能删除');
      return;
    }

    modal.confirm({
      title: '确定要删除该角色吗？',
      content: `删除后将无法恢复，确定要删除 "${record.name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDeleteRole(record.id);
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
      title: '角色名称',
      dataIndex: 'name',
      ellipsis: true,
      hideInSearch: true,
      align: 'center'
    },
    {
      title: '角色标识',
      dataIndex: 'key',
      ellipsis: true,
      copyable: true,
      hideInSearch: true,
      align: 'center'
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: statusEnum,
      render: (_, record) => {
        const status = record.status;
        const label = statusLabelMap[status].label || '未知状态';
        const color = statusLabelMap[status].color || 'success';

        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '角色类型',
      dataIndex: 'isSystem',
      align: 'center',
      valueType: 'select',
      valueEnum: isSystemEnum,
      render: (_, record) => {
        const isSystem = record.isSystem;
        const label = isSystemLabelMap[isSystem].label || '未知状态';
        const color = isSystemLabelMap[isSystem].color || 'success';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      search: false,
      render: (_, record) => <Tag color="blue">{record.userCount || 0} 用户</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      sorter: true
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEditRole(record)}>
          编辑
        </Button>,
        <Button key="delete" disabled={record.isSystem === '1'} type="link" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)}>
          删除
        </Button>
      ]
    }
  ];
};
