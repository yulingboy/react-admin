import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { DictionaryItem } from '@/types/dictionary';
import { getDictionaryItems, addDictionaryItem, updateDictionaryItem, deleteDictionaryItem } from '@/api/dictionary';
import { message, modal } from '@/hooks/useMessage';
import { createDictionaryRenderer, useDictionaryEnum } from '@/utils/dictionaryHelper';
import DictionarySelect from '@/components/Dictionary/DictionarySelect';

// 颜色选项
const colorOptions = [
  { label: '红色', value: '#f5222d' },
  { label: '火山', value: '#fa541c' },
  { label: '日暮', value: '#fa8c16' },
  { label: '金盏花', value: '#faad14' },
  { label: '黄色', value: '#fadb14' },
  { label: '青柠', value: '#a0d911' },
  { label: '绿色', value: '#52c41a' },
  { label: '青色', value: '#13c2c2' },
  { label: '蓝色', value: '#1677ff' },
  { label: '紫色', value: '#722ed1' },
  { label: '洋红', value: '#eb2f96' },
  { label: '灰色', value: '#bfbfbf' },
  { label: '黑色', value: '#000000' }
];

interface DictionaryItemsPanelProps {
  dictionaryId: number;
}

const DictionaryItemsPanel: React.FC<DictionaryItemsPanelProps> = ({ dictionaryId }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentItem, setCurrentItem] = useState<DictionaryItem | null>(null);
  const [formTitle, setFormTitle] = useState('添加字典项');
  const actionRef = useRef<ActionType | null>(null);
  
  // 使用字典数据hook获取枚举值
  const itemStatusEnum = useDictionaryEnum('sys_common_status');

  // 加载字典项数据
  const loadItems = async () => {
    if (!dictionaryId) return [];
    
    setLoading(true);
    try {
      const data = await getDictionaryItems(dictionaryId);
      setItems(data);
      return data;
    } catch (error) {
      console.error('获取字典项失败:', error);
      message.error('获取字典项失败');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 当dictionaryId变化时，重新加载数据
  useEffect(() => {
    if (dictionaryId && actionRef.current) {
      actionRef.current.reload();
    }
  }, [dictionaryId]);

  // 表格列定义
  const columns: ProColumns<DictionaryItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '标签',
      dataIndex: 'label',
      ellipsis: true,
      width: 160,
    },
    {
      title: '值',
      dataIndex: 'value',
      ellipsis: true,
      copyable: true,
      width: 120,
    },
    {
      title: '编码',
      dataIndex: 'code',
      ellipsis: true,
      copyable: true,
      width: 160,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      width: 100,
      search: false,
      render: (_, record) => (
        record.color ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: record.color, 
                marginRight: '8px',
                borderRadius: '2px',
                border: '1px solid #f0f0f0'
              }} 
            />
            {record.color}
          </div>
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
      width: 80,
      valueType: 'select',
      valueEnum: itemStatusEnum,
      render: (_, record) => createDictionaryRenderer('sys_common_status', record.status)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 120,
      render: (_, record) => [
        <Button 
          key="edit" 
          type="link" 
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Button 
          key="delete" 
          type="link" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>
      ],
    },
  ];

  // 添加字典项
  const handleAdd = () => {
    setFormTitle('添加字典项');
    setCurrentItem(null);
    form.setFieldsValue({
      dictionaryId,
      label: '',
      value: '',
      code: '',
      sort: 1,
      status: '1',
      color: '',
    });
    setFormVisible(true);
  };

  // 编辑字典项
  const handleEdit = (record: DictionaryItem) => {
    setFormTitle('编辑字典项');
    setCurrentItem(record);
    form.setFieldsValue(record);
    setFormVisible(true);
  };

  // 删除字典项
  const handleDelete = (record: DictionaryItem) => {
    // 使用同步方式创建确认对话框
    modal.confirm({
      title: '确认删除',
      content: `确定要删除字典项 "${record.label}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      // 使用异步回调函数处理删除操作
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          deleteDictionaryItem(record.id)
            .then(() => {
              message.success('删除成功');
              if (actionRef.current) {
                actionRef.current.reload();
              } else {
                // 如果actionRef不可用，使用备选方案刷新数据
                loadItems();
              }
              resolve();
            })
            .catch((error) => {
              console.error('删除字典项失败:', error);
              message.error('删除失败');
              reject();
            });
        });
      }
    });
  };

  // 提交表单
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentItem) {
        // 更新
        await updateDictionaryItem({
          ...values,
          id: currentItem.id,
        });
        message.success('更新成功');
      } else {
        // 新增
        await addDictionaryItem(values);
        message.success('添加成功');
      }
      setFormVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  // 请求数据接口
  const request = async () => {
    if (!dictionaryId) return { 
      data: [],
      success: true,
      total: 0
    };

    const data = await getDictionaryItems(dictionaryId);
    return {
      data,
      success: true,
      total: data.length
    };
  };

  return (
    <div className="dictionary-items-panel">
      <ProTable<DictionaryItem>
        headerTitle="字典项列表"
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        options={{ search: false, density: false }}
        search={false}
        toolBarRender={() => [
          <Button 
            key="add" 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加字典项
          </Button>
        ]}
        request={request}
        columns={columns}
        pagination={false}
      />

      <Modal
        title={formTitle}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleFormSubmit}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ sort: 1, status: '1', color: '' }}
        >
          <Form.Item name="dictionaryId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="label"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Input placeholder="请输入标签" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="value"
            label="值"
            rules={[{ required: true, message: '请输入值' }]}
          >
            <Input placeholder="请输入值" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="code"
            label="编码"
          >
            <Input 
              placeholder="请输入编码" 
              maxLength={100} 
              disabled={!!currentItem} // 编辑模式时禁用编码输入
            />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} placeholder="请输入排序" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item 
            name="status" 
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <DictionarySelect 
              code="sys_common_status"
              placeholder="请选择状态"
            />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Select
              placeholder="请选择颜色"
              allowClear
              optionLabelProp="label"
              style={{ width: '100%' }}
              dropdownStyle={{ padding: '4px' }}
              options={colorOptions}
              optionRender={(option) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: option.value, 
                      marginRight: '8px',
                      borderRadius: '2px',
                      border: '1px solid #f0f0f0'
                    }} 
                  />
                  {option.label}
                </div>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DictionaryItemsPanel;