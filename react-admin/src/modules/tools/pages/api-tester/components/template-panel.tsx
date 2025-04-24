import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Popconfirm, message, Tag, Modal, Form } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ApiOutlined } from '@ant-design/icons';
import { ApiTestTemplate, HttpMethod } from '@/modules/tools/types/api-tester';
import { 
  getApiTestTemplateList, 
  getApiTestTemplateDetail, 
  createApiTestTemplate, 
  updateApiTestTemplate,
  deleteApiTestTemplate 
} from '@/modules/tools/api/api-tester-api';
import TemplateForm from './template-form';

/**
 * API测试模板面板属性
 */
interface TemplatePanelProps {
  onLoadTemplate?: (template: ApiTestTemplate) => void; // 加载模板到请求面板的回调
}

/**
 * API测试模板列表组件
 * 用于展示和管理API测试模板
 */
const TemplatePanel: React.FC<TemplatePanelProps> = ({ onLoadTemplate }) => {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ApiTestTemplate[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchName, setSearchName] = useState<string>('');
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<ApiTestTemplate | null>(null);
  const [form] = Form.useForm();

  // 加载模板列表
  const loadTemplateList = async () => {
    try {
      setLoading(true);
      const result = await getApiTestTemplateList({
        current,
        pageSize,
        name: searchName || undefined
      });
      setList(result.list);
      setTotal(result.total);
    } catch (error) {
      message.error('加载模板列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和参数变化时加载数据
  useEffect(() => {
    loadTemplateList();
  }, [current, pageSize, searchName]);

  // 处理搜索
  const handleSearch = () => {
    setPage(1);
  };

  // 处理重置
  const handleReset = () => {
    setSearchName('');
    setPage(1);
  };

  // 处理创建
  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setFormVisible(true);
  };

  // 处理编辑
  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const template = await getApiTestTemplateDetail(id);
      setEditingTemplate(template);
      form.setFieldsValue(template);
      setFormVisible(true);
    } catch (error) {
      message.error('获取模板详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await deleteApiTestTemplate(id);
      message.success('删除成功');
      loadTemplateList();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (editingTemplate) {
        // 更新模板
        await updateApiTestTemplate(editingTemplate.id, values);
        message.success('模板更新成功');
      } else {
        // 创建模板
        await createApiTestTemplate(values);
        message.success('模板创建成功');
      }
      
      setFormVisible(false);
      loadTemplateList();
    } catch (error) {
      message.error(editingTemplate ? '更新模板失败' : '创建模板失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理加载模板
  const handleLoadTemplate = async (id: number) => {
    if (!onLoadTemplate) {
      message.info('当前页面不支持加载模板');
      return;
    }

    try {
      setLoading(true);
      const template = await getApiTestTemplateDetail(id);
      onLoadTemplate(template);
      message.success('模板加载成功');
    } catch (error) {
      message.error('加载模板失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取请求方法对应的标签颜色
  const getMethodColor = (method: HttpMethod): string => {
    switch (method) {
      case HttpMethod.GET:
        return 'green';
      case HttpMethod.POST:
        return 'blue';
      case HttpMethod.PUT:
        return 'orange';
      case HttpMethod.DELETE:
        return 'red';
      case HttpMethod.PATCH:
        return 'purple';
      default:
        return 'default';
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      render: (method: HttpMethod) => <Tag color={getMethodColor(method)}>{method}</Tag>
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true
    },
    {
      title: '内容类型',
      dataIndex: 'contentType',
      key: 'contentType',
      ellipsis: true,
      render: (contentType: string) => {
        const label = contentType.split('/').pop();
        return <Tag>{label}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiTestTemplate) => (
        <Space>
          {onLoadTemplate && (
            <Button type="link" size="small" icon={<ApiOutlined />} onClick={() => handleLoadTemplate(record.id)}>
              使用
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个模板吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="template-panel">
      <Card>
        <div className="search-form" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="模板名称"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        <div className="table-operations" style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建模板
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          pagination={{
            current,
            pageSize,
            total,
            onChange: p => setPage(p),
            onShowSizeChange: (_, size) => setPageSize(size),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`
          }}
          loading={loading}
          size="small"
        />
      </Card>

      {/* 模板表单模态框 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <TemplateForm
          form={form}
          initialValues={editingTemplate}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormVisible(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default TemplatePanel;