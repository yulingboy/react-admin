import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { DictionaryItem } from '@/types/dictionary';
import { getDictionaryItems, addDictionaryItem, updateDictionaryItem, deleteDictionaryItem } from '@/api/dictionary';
import { message, modal } from '@/hooks/useMessage';
import DictionaryItemForm from './dictionary-item-form';
import ColorDisplay from './color-display';
import useDictionary from '@/hooks/useDictionaryBack';

interface DictionaryItemsPanelProps {
  dictionaryId: number;
}

const DictionaryItemsPanel: React.FC<DictionaryItemsPanelProps> = ({ dictionaryId }) => {
  const [formVisible, setFormVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<DictionaryItem | null>(null);
  const [formTitle, setFormTitle] = useState('添加字典项');
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType | null>(null);
  // 使用改进的 hook，获取字典数据
  const { valueEnum: statusEnum, labelMap: statusLabelMap } = useDictionary('sys_common_status');
  const { valueEnum: isSystemEnum, labelMap: isSystemLabelMap } = useDictionary('sys_is_system');

  // 当dictionaryId变化时，重新加载数据
  useEffect(() => {
    if (dictionaryId && actionRef.current) {
      actionRef.current.reload();
    }
  }, [dictionaryId]);

  // 表格列定义
  const columns: ProColumns<DictionaryItem>[] = [
    {
      title: '标签',
      dataIndex: 'label',
      ellipsis: true,
      width: 160
    },
    {
      title: '值',
      dataIndex: 'value',
      ellipsis: true,
      copyable: true,
      width: 120
    },
    {
      title: '编码',
      dataIndex: 'code',
      ellipsis: true,
      copyable: true,
      width: 160
    },
    {
      title: '颜色',
      dataIndex: 'color',
      width: 100,
      search: false,
      render: (_, record) => (record.color ? <ColorDisplay color={record.color} /> : '-')
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
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
      title: '系统内置',
      dataIndex: 'isSystem',
      valueType: 'select',
      width: 120,
      align: 'center',
      valueEnum: isSystemEnum,
      render: (_, record) => {
        const isSystem = record.isSystem;
        const label = isSystemLabelMap[isSystem].label || '未知状态';
        const color = isSystemLabelMap[isSystem].color || 'success';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
      sorter: true
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          删除
        </Button>
      ]
    }
  ];

  // 添加字典项
  const handleAdd = () => {
    setFormTitle('添加字典项');
    setCurrentItem(null);
    setFormVisible(true);
  };

  // 编辑字典项
  const handleEdit = (record: DictionaryItem) => {
    setFormTitle('编辑字典项');
    setCurrentItem(record);
    setFormVisible(true);
  };

  // 删除字典项
  const handleDelete = (record: DictionaryItem) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除字典项 "${record.label}" 吗？`,
      onOk: async () => {
        try {
          await deleteDictionaryItem(record.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          console.error('删除字典项失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  // 提交表单
  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (currentItem) {
        // 更新
        await updateDictionaryItem({
          ...values,
          id: currentItem.id
        });
        message.success('更新成功');
      } else {
        // 新增
        await addDictionaryItem(values);
        message.success('添加成功');
      }

      setLoading(false);
      setFormVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      setLoading(false);
      console.error('表单提交失败:', error);
    }
  };

  // 请求数据接口
  const request = async () => {
    if (!dictionaryId)
      return {
        data: [],
        success: true,
        total: 0
      };

    try {
      const data = await getDictionaryItems(dictionaryId);
      return {
        data,
        success: true,
        total: data.length
      };
    } catch (error) {
      console.error('获取字典项失败:', error);
      message.error('获取字典项失败');
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  return (
    <div className="dictionary-items-panel">
      <ProTable<DictionaryItem>
        headerTitle="字典项列表"
        actionRef={actionRef}
        rowKey="id"
        options={{ search: false, density: false }}
        search={false}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加字典项
          </Button>
        ]}
        request={request}
        columns={columns}
        pagination={false}
      />

      <Modal title={formTitle} open={formVisible} onCancel={() => setFormVisible(false)} footer={null} destroyOnClose maskClosable={false}>
        <DictionaryItemForm
          dictionaryId={dictionaryId}
          initialValues={currentItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormVisible(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default DictionaryItemsPanel;
