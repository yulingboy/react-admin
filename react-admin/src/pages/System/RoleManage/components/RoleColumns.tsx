import React, { useState } from 'react';
import { Button, Tag, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Role } from '@/types/role';
import { createDictionaryRenderer, useDictionaryEnum } from '@/utils/dictionaryHelper';

interface RoleColumnsProps {
  handleEditRole: (record: Role) => void;
  handleDeleteRole: (id: number) => void;
}

export const getRoleColumns = ({ handleEditRole, handleDeleteRole }: RoleColumnsProps): ProColumns<Role>[] => {
  const getDeleteButton = (record: Role) => {
    if (record.isSystem === '1') {
      return (
        <Tooltip key="systemRole" title="系统内置角色不可删除">
          <Button 
            type="link" 
            icon={<LockOutlined />}
            disabled
          >
            删除
          </Button>
        </Tooltip>
      );
    }

    const DeleteButton: React.FC = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);

      const showModal = () => {
        setIsModalOpen(true);
      };

      const handleOk = () => {
        setIsModalOpen(false);
        handleDeleteRole(record.id);
      };

      const handleCancel = () => {
        setIsModalOpen(false);
      };

      return (
        <>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={showModal}
          >
            删除
          </Button>
          <Modal
            title="删除确认"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确定"
            cancelText="取消"
          >
            <p>确定要删除角色 <strong>{record.name}</strong> 吗？</p>
          </Modal>
        </>
      );
    };

    return <DeleteButton />;
  };

  // 使用新的hook获取字典枚举值
  const statusEnum = useDictionaryEnum('sys_common_status');
  const roleTypeEnum = useDictionaryEnum('sys_is_system');

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '角色标识',
      dataIndex: 'key',
      ellipsis: true,
      copyable: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      // 使用hook获取的字典数据作为搜索下拉选项
      valueEnum: statusEnum,
      // 使用字典标签渲染状态
      render: (_, record) => createDictionaryRenderer('sys_common_status', record.status),
    },
    {
      title: '角色类型',
      dataIndex: 'isSystem',
      valueType: 'select',
      // 使用hook获取的字典数据作为搜索下拉选项
      valueEnum: roleTypeEnum,
      // 使用字典标签渲染角色类型
      render: (_, record) => createDictionaryRenderer('sys_is_system', record.isSystem),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      search: false,
      render: (_, record) => (
        <Tag color="blue">{record.userCount || 0} 用户</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <Button 
          key="edit" 
          type="link" 
          icon={<EditOutlined />}
          onClick={() => handleEditRole(record)}
        >
          编辑
        </Button>,
        <React.Fragment key="delete">
          {getDeleteButton(record)}
        </React.Fragment>
      ],
    },
  ];
};