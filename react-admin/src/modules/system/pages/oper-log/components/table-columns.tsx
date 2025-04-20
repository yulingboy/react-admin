import { Tag, Tooltip } from 'antd';
import { ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';

/**
 * 操作日志表格列配置
 */
export const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 80,
  },
  {
    title: '操作模块',
    dataIndex: 'title',
    ellipsis: true,
    width: 120,
  },
  {
    title: '操作人员',
    dataIndex: 'operName',
    width: 120,
    ellipsis: true,
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    width: 120,
    valueEnum: {
      '0': { text: '其它' },
      '1': { text: '新增' },
      '2': { text: '修改' },
      '3': { text: '删除' },
      '4': { text: '授权' },
      '5': { text: '导出' },
      '6': { text: '导入' },
      '7': { text: '强退' },
      '8': { text: '清空数据' },
    },
  },
  {
    title: '请求方法',
    dataIndex: 'requestMethod',
    width: 100,
    hideInSearch: true,
  },
  {
    title: '请求URL',
    dataIndex: 'operUrl',
    width: 150,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '操作IP',
    dataIndex: 'operIp',
    width: 120,
    ellipsis: true,
    hideInSearch: true,
    render: (_, record) => (
      <Tooltip title={record.operLocation}>
        {record.operIp}
      </Tooltip>
    ),
  },
  {
    title: '操作地点',
    dataIndex: 'operLocation',
    width: 150,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '操作状态',
    dataIndex: 'status',
    width: 100,
    valueEnum: {
      '0': { text: '正常', status: 'Success' },
      '1': { text: '异常', status: 'Error' },
    },
    render: (_, record) => (
      <Tag color={record.status === '0' ? 'success' : 'error'}>
        {record.status === '0' ? '正常' : '异常'}
      </Tag>
    ),
  },
  {
    title: '操作时间',
    dataIndex: 'operTime',
    width: 180,
    sorter: true,
    valueType: 'dateTime',
    render: (_, record) => (
      <span>{dayjs(record.operTime).format('YYYY-MM-DD HH:mm:ss')}</span>
    ),
  },
];