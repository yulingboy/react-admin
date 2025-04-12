import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select } from 'antd';
import { ProForm } from '@ant-design/pro-components';
import DictionarySelect from '@/components/DictionarySelect';
import { DictionaryTag } from '@/components/DictionaryTag';
import { useDictionary } from '@/hooks/useDictionary';

const FormExample: React.FC = () => {
  const [form] = Form.useForm();
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleSubmit = async (values: any) => {
    console.log('表单提交数据:', values);
    setSubmitResult(values);
  };

  return (
    <Card title="基础表单 - 使用字典数据" bordered={false} className="form-card">
      <ProForm
        form={form}
        onFinish={handleSubmit}
        submitter={{
          render: (props, dom) => <Button type="primary" onClick={props.form?.submit}>提交</Button>,
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <DictionarySelect code="gender" placeholder="请选择性别" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="department"
              label="部门"
              rules={[{ required: true, message: '请选择部门' }]}
            >
              <DictionarySelect code="department" placeholder="请选择部门" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="education"
              label="学历"
            >
              <DictionarySelect code="education" placeholder="请选择学历" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <DictionarySelect code="user_status" placeholder="请选择状态" />
            </Form.Item>
          </Col>
        </Row>
      </ProForm>

      {submitResult && (
        <Card title="表单提交结果" className="mt-4">
          <div className="mb-2">
            <strong>姓名:</strong> {submitResult.name}
          </div>
          <div className="mb-2">
            <strong>性别:</strong> <DictionaryTag code="gender" value={submitResult.gender} />
          </div>
          <div className="mb-2">
            <strong>部门:</strong> <DictionaryTag code="department" value={submitResult.department} />
          </div>
          <div className="mb-2">
            <strong>学历:</strong> <DictionaryTag code="education" value={submitResult.education} />
          </div>
          <div className="mb-2">
            <strong>状态:</strong> <DictionaryTag 
              code="user_status" 
              value={submitResult.status} 
              colorMapping={{
                "1": "success",
                "0": "error"
              }} 
            />
          </div>
        </Card>
      )}

      {/* 直接使用useDictionary获取数据 */}
      <DirectDictionarySelect />
    </Card>
  );
};

// 直接使用useDictionary获取数据的组件示例
const DirectDictionarySelect: React.FC = () => {
  // useDictionary现在直接返回options数组
  const departmentOptions = useDictionary('department');
  
  return (
    <Card title="直接使用hook获取字典数据" className="mt-4">
      <p>这个组件直接使用useDictionary hook获取数据，每个组件独立获取自己需要的字典数据</p>
      <Form layout="vertical">
        <Form.Item label="部门">
          <Select
            placeholder="请选择部门"
            options={departmentOptions.map(item => ({
              label: item.label,
              value: item.value
            }))}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormExample;
