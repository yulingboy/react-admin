import { Button, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Dictionary } from '@/modules/system/types/dictionary';
import { modal } from '@/hooks/useMessage';
import { useDictionary } from '@/hooks/useDictionaryBack';

interface TableColumnsProps {
  handleEdit: (record: Dictionary) => void;
  handleDelete: (record: Dictionary) => void;
  handleSelect: (record: Dictionary) => void;
}

export const getDictionaryColumns = ({ handleEdit, handleDelete, handleSelect }: TableColumnsProps): ProColumns<Dictionary>[] => {
  // 获取字典类型枚举值
  const { valueEnum: isSystemEnum, labelMap: isSystemLabelMap } = useDictionary('sys_is_system');
  const { valueEnum: statusEnum, labelMap: statusLabelMap } = useDictionary('sys_common_status');

  // 生成删除按钮
  const getDeleteButton = (record: Dictionary) => {
    // 系统内置字典不允许删除
    if (record.isSystem === '1') {
      return (
        <Tooltip key="systemDict" title="系统内置字典不可删除">
          <Button type="link" icon={<LockOutlined />} disabled>
            删除
          </Button>
        </Tooltip>
      );
    }

    // 普通字典可以删除
    return (
      <Button
        key="delete"
        type="link"
        danger
        icon={<DeleteOutlined />}
        onClick={e => {
          e.stopPropagation();
          modal.confirm({
            title: '删除确认',
            content: `确定要删除字典 "${record.name}" 吗？`,
            onOk: () => handleDelete(record)
          });
        }}
      >
        删除
      </Button>
    );
  };

  return [
    //  关键字
    {
      title: '关键字',
      dataIndex: 'keyword',
      hideInTable: true
    },
    {
      title: '字典名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 180,
      hideInSearch: true
    },
    {
      title: '字典编码',
      dataIndex: 'code',
      ellipsis: true,
      copyable: true,
      width: 200,
      hideInSearch: true
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
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 120,
      align: 'center',
      valueEnum: statusEnum,
      render: (_, record) => {
        const status = record.status;
        const label = statusLabelMap[status].label || '未知状态';
        const color = statusLabelMap[status].color || 'success';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false
      // width: 250,
    },

    {
      title: '操作',
      valueType: 'option',
      width: 300,
      render: (_, record) => [
        <Tooltip key="view" title="查看字典项">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={e => {
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
          onClick={e => {
            e.stopPropagation();
            handleEdit(record);
          }}
        >
          编辑
        </Button>,
        getDeleteButton(record)
      ]
    }
  ];
};
