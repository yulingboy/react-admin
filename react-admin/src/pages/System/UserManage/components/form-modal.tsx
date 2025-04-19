import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { createUser, updateUser } from '@/api/user';
import { useDictionary } from '@/hooks/useDictionaryBack';
import { UserFormData } from '@/types/user';

const FormItem = Form.Item;

interface FormModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: UserFormData;
    isEdit?: boolean;
    roleOptions: { label: string; value: number }[];
}

const FormModal: React.FC<FormModalProps> = ({ open, onCancel, onSuccess, initialValues, isEdit = false, roleOptions }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 使用hook获取状态字典数据
    const { selectOptions: statusOptions } = useDictionary('sys_common_status');

    // 设置表单初始值
    useEffect(() => {
        if (open) {
            if (initialValues) {
                console.log('Setting form values:', initialValues);
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                form.setFieldsValue({ status: '1' }); // 默认启用
            }
        }
    }, [form, initialValues, open]);

    // 提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            setLoading(true);
            const apiMethod = isEdit ? updateUser : createUser;

            if (isEdit && initialValues?.id) {
                await apiMethod({ ...values, id: initialValues.id });

            } else {
                await apiMethod(values);

            }
            message.success(`${isEdit ? '编辑' : '新增'}成功`);

            onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isEdit ? '编辑' : '新增'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okButtonProps={{ loading }}
            destroyOnClose
            maskClosable={false}
            width={520}
            afterOpenChange={(visible) => {
                if (visible && initialValues) {
                    // 确保Modal显示后也设置一次表单值
                    form.setFieldsValue(initialValues);
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <FormItem
                    name="username"
                    label="用户名"
                    rules={[
                        { required: true, message: '请输入用户名' },
                        { min: 3, max: 20, message: '用户名长度为3-20个字符' }
                    ]}
                >
                    <Input prefix={<UserOutlined />} placeholder="请输入用户名" disabled={isEdit} />
                </FormItem>

                <FormItem
                    name="name"
                    label="姓名"
                    rules={[
                        { required: true, message: '请输入姓名' },
                        { max: 30, message: '姓名最大长度为30个字符' }
                    ]}
                >
                    <Input placeholder="请输入姓名" />
                </FormItem>

                <FormItem
                    name="email"
                    label="电子邮箱"
                    rules={[
                        { required: true, message: '请输入电子邮箱' },
                        { type: 'email', message: '请输入有效的电子邮箱' },
                        { max: 50, message: '电子邮箱最大长度为50个字符' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="请输入电子邮箱"
                    />
                </FormItem>

                <FormItem
                    name="status"
                    label="状态"
                    rules={[{ required: true, message: '请选择状态' }]}
                >
                    <Select
                        placeholder="请选择状态"
                        options={statusOptions}
                    />
                </FormItem>

                <FormItem
                    name="roleId"
                    label="角色"
                    rules={[{ required: true, message: '请选择角色' }]}
                >
                    <Select
                        placeholder="请选择角色"
                        options={roleOptions}
                    />
                </FormItem>
            </Form>
        </Modal>
    );
};

export default FormModal;
