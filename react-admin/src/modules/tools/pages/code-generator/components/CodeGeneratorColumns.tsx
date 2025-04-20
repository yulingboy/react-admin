import React from 'react';
import { Button, Space, Tag, Tooltip, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { CodeGenerator } from '@/modules/tools/types/code-generator';
import type { ProColumns } from '@ant-design/pro-components';

/**
 * 获取代码生成器表格列配置
 */
export const getCodeGeneratorColumns = (props: {
  handleEdit: (record: CodeGenerator) => void;
  handleDelete: (record: CodeGenerator) => void;
  handlePreview: (record: CodeGenerator) => void;
  handleGenerate: (record: CodeGenerator) => void;
  handleConfig: (record: CodeGenerator) => void;
}): ProColumns<CodeGenerator>[] => {
  const { handleEdit, handleDelete, handlePreview, handleGenerate, handleConfig } = props;

  return [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
      align: 'center'
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      tip: '生成器名称',
      width: 200
    },
    {
      title: '表名称',
      dataIndex: 'tableName',
      ellipsis: true,
      width: 180
    },
    {
      title: '模块名称',
      dataIndex: 'moduleName',
      ellipsis: true,
      width: 120
    },
    {
      title: '业务名称',
      dataIndex: 'businessName',
      ellipsis: true,
      width: 120
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search: false,
      width: 120
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 160
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 280,
      render: (_, record) => [
        <Tooltip key="config" title="配置">
          <Button type="primary" size="small" icon={<SyncOutlined />} onClick={() => handleConfig(record)}>
            配置
          </Button>
        </Tooltip>,
        <Tooltip key="preview" title="预览">
          <Button type="default" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            预览
          </Button>
        </Tooltip>,
        <Tooltip key="generate" title="生成代码">
          <Button type="default" size="small" icon={<CloudDownloadOutlined />} onClick={() => handleGenerate(record)}>
            生成
          </Button>
        </Tooltip>,
        <Tooltip key="edit" title="编辑">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Tooltip>,
        <Popconfirm key="delete" title="确定要删除该配置吗?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
          <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ]
    }
  ];
};
