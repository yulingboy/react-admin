import { Tag, Tooltip } from 'antd';
import { ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';

/**
 * 登录日志表格列配置
 */
export const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 80,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    ellipsis: true,
    width: 120,
  },
  {
    title: '登录地址',
    dataIndex: 'ipAddress',
    width: 120,
    ellipsis: true,
    render: (_, record) => (
      <Tooltip title={record.loginLocation}>
        {record.ipAddress}
      </Tooltip>
    ),
  },
  {
    title: '登录地点',
    dataIndex: 'loginLocation',
    width: 120,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    width: 140,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    width: 120,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '登录状态',
    dataIndex: 'status',
    width: 120,
    valueEnum: {
      '0': { text: '失败', status: 'Error' },
      '1': { text: '成功', status: 'Success' },
    },
    render: (_, record) => (
      <Tag color={record.status === '1' ? 'success' : 'error'}>
        {record.status === '1' ? '成功' : '失败'}
      </Tag>
    ),
  },
  {
    title: '提示消息',
    dataIndex: 'msg',
    width: 180,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '登录时间',
    dataIndex: 'loginTime',
    width: 180,
    sorter: true,
    valueType: 'dateTime',
    render: (_, record) => (
      <span>{dayjs(record.loginTime).format('YYYY-MM-DD HH:mm:ss')}</span>
    ),
  },
];