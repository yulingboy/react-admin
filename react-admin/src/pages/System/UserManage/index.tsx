import React, { useState, useRef } from 'react';
import { Button, Badge, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ProTable, ActionType } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { UserType, UserFormData, userTypeMap, deptMap } from './types';
import UserFormModal from './components/UserFormModal';
import ViewUserDrawer from './components/ViewUserDrawer';

const UserManage: React.FC = () => {
  const [userFormVisible, setUserFormVisible] = useState<boolean>(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  // 模拟的用户数据
  const mockUsers: UserType[] = [
    {
      userId: 1,
      userName: 'admin',
      nickName: '小蒋',
      email: '87789771@qq.com',
      phonenumber: '15888888888',
      sex: '1',
      status: '0',
      deptId: 103,
      remark: '管理员',
      createTime: '2024-05-17T16:07:16.000Z',
      userType: '00',
      loginDate: null,
      loginIp: '',
      avatar: null
    },
    {
      userId: 2,
      userName: 'editor',
      nickName: '李四',
      email: 'lisi@example.com',
      phonenumber: '13566667777',
      sex: '0',
      status: '0',
      deptId: 104,
      remark: '编辑',
      createTime: '2024-05-16T10:30:00.000Z',
      userType: '01',
      loginDate: '2024-05-17T08:15:00.000Z',
      loginIp: '192.168.1.100',
      avatar: null
    }
  ];

  // 处理用户状态显示
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '0':
        return <Badge status="success" text="正常" />;
      case '1':
        return <Badge status="error" text="停用" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  const handleView = (record: UserType) => {
    setCurrentUser(record);
    setViewDrawerVisible(true);
  };

  const handleAdd = () => {
    setCurrentUser(undefined);
    setIsEdit(false);
    setUserFormVisible(true);
  };

  const handleEdit = (record: UserType) => {
    setCurrentUser(record);
    setIsEdit(true);
    setUserFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    // 模拟删除操作
    message.success(`成功删除用户ID: ${id}`);
    actionRef.current?.reload();
  };

  const columns: ProColumns<UserType>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 80,
      search: false
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      ellipsis: true
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      ellipsis: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true
    },
    {
      title: '手机号',
      dataIndex: 'phonenumber',
      ellipsis: true
    },
    {
      title: '性别',
      dataIndex: 'sex',
      valueEnum: {
        '0': { text: '女' },
        '1': { text: '男' }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => getStatusBadge(record.status),
      valueEnum: {
        '0': { text: '正常', status: 'Success' },
        '1': { text: '停用', status: 'Error' }
      }
    },
    {
      title: '角色',
      dataIndex: 'userType',
      render: (_, record) => {
        return <Tag color="blue">{userTypeMap[record.userType] || '普通用户'}</Tag>;
      },
      valueEnum: {
        '00': { text: '管理员' },
        '01': { text: '编辑' },
        '02': { text: '普通用户' }
      }
    },
    {
      title: '部门',
      dataIndex: 'deptId',
      search: false,
      render: (_, record) => {
        return deptMap[record.deptId] || '-';
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      sorter: true
    },
    {
      title: '最后登录',
      dataIndex: 'loginDate',
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.loginDate || '-'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search: false
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          查看
        </Button>,
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Popconfirm key="delete" title="确定要删除此用户吗?" onConfirm={() => handleDelete(record.userId)} okText="确定" cancelText="取消">
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ]
    }
  ];

  // 处理用户表单提交
  const handleUserFormFinish = async (values: UserFormData) => {
    console.log(isEdit ? '更新用户:' : '创建用户:', values);

    // 模拟创建或更新用户
    message.success(isEdit ? '更新用户成功' : '创建用户成功');
    setUserFormVisible(false);
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable<UserType>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="userId"
        search={{
          labelWidth: 120
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
            新建用户
          </Button>
        ]}
        request={async params => {
          // 模拟从API获取数据
          console.log('请求参数:', params);
          return {
            data: mockUsers,
            success: true,
            total: mockUsers.length
          };
        }}
        pagination={{
          pageSize: 10
        }}
        columns={columns}
      />

      {/* 用户表单模态框 (创建/编辑) */}
      <UserFormModal
        visible={userFormVisible}
        onVisibleChange={setUserFormVisible}
        onFinish={handleUserFormFinish}
        userInfo={currentUser}
        title={isEdit ? '编辑用户' : '新建用户'}
        isEdit={isEdit}
      />

      {/* 查看用户详情抽屉 */}
      <ViewUserDrawer visible={viewDrawerVisible} onClose={() => setViewDrawerVisible(false)} userInfo={currentUser} />
    </>
  );
};

export default UserManage;
