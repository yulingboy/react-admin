import { Button, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { useDictionary } from '@/hooks/useDictionaryBack';
import { User } from '@/types/user';
import { message, modal } from '@/hooks/useMessage';

interface ColumnsProps {
  handleEdit: (record: User) => void;
  handleDelete: (id: number) => void;
  roleOptions: { label: string; value: number }[];
}

export const getTableColumns = ({ handleEdit, handleDelete, roleOptions }: ColumnsProps): ProColumns<User>[] => {
  // 使用改进的 hook，获取字典数据
  const { valueEnum: statusEnum, labelMap: statusLabelMap } = useDictionary('sys_common_status');
  const { valueEnum: isSystemEnum, labelMap: isSystemLabelMap } = useDictionary('sys_is_system');

  // 处理删除操作，增加二次确认
  const confirmDelete = (record: User) => {
    if (record.isSystem === '1') {
      message.warning('系统内置用户不能删除');
      return;
    }

    modal.confirm({
      title: '确定要删除该用户吗？',
      content: `删除后将无法恢复，确定要删除 "${record.username}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDelete(record.id);
        message.success('删除成功');
      }
    });
  };

  return [
    // 关键字搜索
    {
      title: '关键字',
      dataIndex: 'keyword',
      valueType: 'text',
      hideInTable: true
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
      align: 'center',
      hideInSearch: true
    },
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
      align: 'center',
      hideInSearch: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true,
      hideInSearch: true
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
      title: '角色',
      align: 'center',
      dataIndex: 'roleId',
      valueType: 'select',
      valueEnum: roleOptions.reduce<Record<number, { text: string; status: string }>>((acc, role) => {
        acc[role.value] = { text: role.label, status: 'Default' };
        return acc;
      }, {}),
      render: (_, record) => <Tag color="blue">{record.roleName}</Tag>
    },
    {
      title: '系统内置',
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
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      align: 'center',
      search: false,
      sorter: true
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      width: 180,
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
