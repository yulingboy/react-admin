import React from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProFormRadio, ProFormTextArea } from '@ant-design/pro-components';
import { UserType, UserFormData, sexOptions, statusOptions, userTypeOptions } from '../types';

interface UserFormModalProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish: (values: UserFormData) => Promise<void>;
  userInfo?: UserType;
  title: string;
  isEdit: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ visible, onVisibleChange, onFinish, userInfo, title, isEdit }) => {
  return (
    <ModalForm<UserFormData> title={title} width={600} open={visible} onOpenChange={onVisibleChange} onFinish={onFinish} initialValues={userInfo}>
      <ProFormText name="userName" label="用户名" placeholder="请输入用户名" rules={[{ required: true, message: '请输入用户名' }]} disabled={isEdit} />
      <ProFormText name="nickName" label="昵称" placeholder="请输入昵称" rules={[{ required: true, message: '请输入昵称' }]} />
      <ProFormText
        name="email"
        label="邮箱"
        placeholder="请输入邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      />
      <ProFormText
        name="phonenumber"
        label="手机号"
        placeholder="请输入手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1\d{10}$/, message: '请输入有效的手机号' }
        ]}
      />
      <ProFormRadio.Group name="sex" label="性别" options={sexOptions} rules={[{ required: true, message: '请选择性别' }]} />
      <ProFormRadio.Group name="status" label="状态" options={statusOptions} rules={[{ required: true, message: '请选择状态' }]} />
      <ProFormSelect name="userType" label="角色" options={userTypeOptions} rules={[{ required: true, message: '请选择角色' }]} />
      {!isEdit && <ProFormText.Password name="password" label="密码" placeholder="请输入密码" rules={[{ required: !isEdit, message: '请输入密码' }]} />}
      <ProFormTextArea name="remark" label="备注" placeholder="请输入备注" />
    </ModalForm>
  );
};

export default UserFormModal;
