import React from 'react';
import { Modal, Descriptions, Badge, Tag, Typography } from 'antd';
import { UserType, userTypeMap, deptMap } from '../types';

interface ViewUserModalProps {
  visible: boolean;
  onCancel: () => void;
  userInfo: UserType | undefined;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ visible, onCancel, userInfo }) => {
  if (!userInfo) {
    return null;
  }

  return (
    <Modal title="用户详情" open={visible} onCancel={onCancel} width={800} footer={null}>
      <Descriptions column={1} bordered={false}>
        <Descriptions.Item label="用户名">{userInfo.userName}</Descriptions.Item>
        <Descriptions.Item label="用户ID">{userInfo.userId}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{userInfo.email}</Descriptions.Item>
        <Descriptions.Item label="手机号">{userInfo.phonenumber}</Descriptions.Item>
        <Descriptions.Item label="性别">{userInfo.sex === '1' ? '男' : '女'}</Descriptions.Item>
        <Descriptions.Item label="状态">
          {userInfo.status === '0' ? <Badge status="success" text="正常" /> : <Badge status="error" text="停用" />}
        </Descriptions.Item>
        <Descriptions.Item label="角色">
          <Tag color="blue">{userTypeMap[userInfo.userType] || '普通用户'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="部门">{deptMap[userInfo.deptId] || '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{new Date(userInfo.createTime).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="最后登录">{userInfo.loginDate ? new Date(userInfo.loginDate).toLocaleString() : '-'}</Descriptions.Item>
        {userInfo.remark && (
          <Descriptions.Item label="备注" span={2} contentStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {userInfo.remark}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default ViewUserModal;
