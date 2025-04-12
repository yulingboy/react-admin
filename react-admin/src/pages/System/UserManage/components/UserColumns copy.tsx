import React, { useState } from 'react';
import { Button, Modal, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { User, USER_STATUS } from '@/types/user';
import { useDictionary } from '@/hooks/useDictionary';
import DictionarySelect from '@/components/DictionarySelect';
import DictionaryTag from '@/components/DictionaryTag';

interface UserColumnsProps {
  handleEditUser: (record: User) => void;
  handleDeleteUser: (id: number) => void;
}

export const getUserColumns = ({ handleEditUser, handleDeleteUser }: UserColumnsProps): ProColumns<User>[] => {
  // useDictionary现在直接返回options数组
  const userStatusOptions = useDictionary('sys_normal_disable');
  const userTypeOptions = useDictionary('sys_yes_no');

  const getDeleteButton = (record: User) => {
    // 系统内置用户不可删除
    if (record.isSystem === 1) {
      return (
        <Tooltip key="systemUser" title="系统内置用户不可删除">
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
        handleDeleteUser(record.id);
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
            <p>确定要删除用户 <strong>{record.username}</strong> 吗？</p>
          </Modal>
        </>
      );
    };

    return <DeleteButton />;
  };

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      renderFormItem: () => (
        <DictionarySelect 
          options={userStatusOptions}
          placeholder="请选择状态" 
        />
      ),
      render: (_, record) => (
        <DictionaryTag 
          options={userStatusOptions}
          value={record.status} 
          colorMapping={{
            "1": "success",
            "0": "error"
          }}
        />
      ),
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      valueType: 'select',
      renderFormItem: () => (
        <DictionarySelect 
          options={userTypeOptions}
          placeholder="请选择用户类型" 
        />
      ),
      render: (_, record) => (
        <DictionaryTag 
          options={userTypeOptions}
          value={record.isSystem === 1 ? 'Y' : 'N'}  // 转换为字典中的值
          colorMapping={{
            "Y": "warning",
            "N": "default"
          }}
        />
      ),
    },
    {
      title: '角色',
      dataIndex: 'roleName',
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
          onClick={() => handleEditUser(record)}
        >
          编辑
        </Button>,
        getDeleteButton(record)
      ],
    },
  ];
};