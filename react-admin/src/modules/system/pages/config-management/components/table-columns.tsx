import { Button, Tag, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { useDictionary } from '@/hooks/useDictionaryBack';
import { Config } from '@/modules/system/types/config';
import { message, modal } from '@/hooks/useMessage';

interface ColumnsProps {
  handleEdit: (record: Config) => void;
  handleDelete: (id: number) => void;
  groupOptions: string[];
}

export const getTableColumns = ({ 
  handleEdit, 
  handleDelete,
  groupOptions
}: ColumnsProps): ProColumns<Config>[] => {
  // 使用字典数据
  const { valueEnum: statusEnum, labelMap: statusLabelMap } = useDictionary('sys_common_status');
  const { valueEnum: isSystemEnum, labelMap: isSystemLabelMap } = useDictionary('sys_is_system');

  // 处理删除操作，增加二次确认
  const confirmDelete = (record: Config) => {
    if (record.isSystem === '1') {
      message.warning('系统内置配置不能删除');
      return;
    }

    modal.confirm({
      title: '确定要删除该配置吗？',
      content: `删除后将无法恢复，确定要删除配置 "${record.key}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDelete(record.id);
        message.success('删除成功');
      }
    });
  };

  // 将groupOptions转换为valueEnum格式
  const groupValueEnum = groupOptions.reduce((acc, group) => {
    acc[group] = { text: group };
    return acc;
  }, {} as Record<string, { text: string }>);

  return [
    {
      title: '关键字',
      dataIndex: 'keyword',
      hideInTable: true
    },
    {
      title: '配置分组',
      dataIndex: 'group',
      valueType: 'select',
      valueEnum: groupValueEnum,
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.group || '默认分组'}</Tag>
      )
    },
    {
      title: '配置键名',
      dataIndex: 'key',
      ellipsis: true,
      copyable: true,
      align: 'center',
      width: 220,
      hideInSearch: true
    },
    {
      title: '配置值',
      dataIndex: 'value',
      ellipsis: true,
      copyable: true,
      width: 220,
      hideInSearch: true
    },
    {
      title: '配置类型',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      hideInSearch: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: statusEnum,
      width: 100,
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
      align: 'center',
      valueType: 'select',
      valueEnum: isSystemEnum,
      width: 100,
      render: (_, record) => {
        const isSystem = record.isSystem;
        const label = isSystemLabelMap[isSystem].label || '未知状态';
        const color = isSystemLabelMap[isSystem].color || 'success';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
      width: 80,
      hideInSearch: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      align: 'center',
      width: 160,
      hideInSearch: true,
      sorter: true
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
        <Button key="delete" disabled={record.isSystem === '1'} type="link" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)}>
          删除
        </Button>
      ]
    }
  ];
};