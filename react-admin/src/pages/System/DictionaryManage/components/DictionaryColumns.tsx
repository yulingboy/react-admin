import React, { useState } from 'react';
import { Button, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Dictionary } from '@/types/dictionary';
import { createDictionaryRenderer, useDictionaryEnum } from '@/utils/dictionaryHelper';

interface DictionaryColumnsProps {
  handleEdit: (record: Dictionary) => void;
  handleDelete: (record: Dictionary) => void;
  handleSelect: (record: Dictionary) => void;
}

export const getDictionaryColumns = ({ handleEdit, handleDelete, handleSelect }: DictionaryColumnsProps): ProColumns<Dictionary>[] => {
  // 获取字典类型枚举值
  const dictTypeEnum = useDictionaryEnum('sys_is_system');

  // 生成删除按钮
  const getDeleteButton = (record: Dictionary) => {
    // 系统内置字典不允许删除
    if (record.isSystem === '1') {
      return (
        <Tooltip key="systemDict" title="系统内置字典不可删除">
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

    // 普通字典可以删除
    const DeleteButton: React.FC = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);

      const showModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
      };

      const handleOk = () => {
        setIsModalOpen(false);
        handleDelete(record);
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
            <p>确定要删除字典 <strong>{record.name}</strong> 吗？</p>
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
      width: 80,
      search: false,
    },
    {
      title: '字典名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 180,
    },
    {
      title: '字典编码',
      dataIndex: 'code',
      ellipsis: true,
      copyable: true,
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'isSystem',
      valueType: 'select',
      width: 120,
      valueEnum: dictTypeEnum,
      render: (_, record) => createDictionaryRenderer('sys_is_system', record.isSystem)
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
      width: 250,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
      width: 170,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
      width: 170,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 180,
      render: (_, record) => [
        <Tooltip key="view" title="查看字典项">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(record);
            }}
          >
            查看
          </Button>
        </Tooltip>,
        <Button 
          key="edit" 
          type="link" 
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(record);
          }}
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