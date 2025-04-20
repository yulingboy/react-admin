import React, { useEffect } from 'react';
import { Form, Input, Modal, Radio, Space, Button, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { 
  createScheduleJob, 
  updateScheduleJob, 
  getScheduleJobById 
} from '@/api/schedule-job';
import { ScheduleJob, misfirePolicyOptions, concurrentOptions, statusOptions } from '@/types/schedule-job';

interface ScheduleJobFormProps {
  visible: boolean;
  job: ScheduleJob | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ScheduleJobForm: React.FC<ScheduleJobFormProps> = ({
  visible,
  job,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isEdit = !!job;

  // 表单初始化
  useEffect(() => {
    // 编辑模式下，从后端获取最新的任务数据
    const fetchJobDetails = async () => {
      if (isEdit && job) {
        try {
          setLoading(true);
          const response = await getScheduleJobById(job.id);
          form.setFieldsValue({
            ...response,
          });
        } catch (error) {
          message.error('获取任务详情失败');
          console.error('获取任务详情失败:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (visible) {
      form.resetFields();
      if (isEdit) {
        fetchJobDetails();
      } else {
        // 设置新建任务的默认值
        form.setFieldsValue({
          jobGroup: 'DEFAULT',
          concurrent: '1',
          misfirePolicy: '1',
          status: '0',
        });
      }
    }
  }, [visible, isEdit, job, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit && job) {
        // 更新任务
        await updateScheduleJob({
          ...values,
          id: job.id,
        });
        message.success('更新成功');
      } else {
        // 创建新任务
        await createScheduleJob(values);
        message.success('创建成功');
      }
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`提交失败: ${error.message}`);
      } else {
        message.error('提交失败，请检查表单');
      }
      console.error('表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试Cron表达式
  const handleTestCron = () => {
    const cronExpression = form.getFieldValue('cronExpression');
    if (!cronExpression) {
      message.warning('请先输入Cron表达式');
      return;
    }

    // TODO: 这里可以添加Cron表达式测试预览功能
    message.info('Cron表达式测试功能待实现');
  };

  return (
    <Modal
      title={isEdit ? '编辑任务' : '创建任务'}
      open={visible}
      width={800}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          确定
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          name="jobName"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="jobGroup"
          label="任务分组"
          rules={[{ required: true, message: '请选择任务分组' }]}
        >
          <Radio.Group>
            <Radio value="DEFAULT">默认</Radio>
            <Radio value="SYSTEM">系统</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="invokeTarget"
          label="调用目标"
          rules={[{ required: true, message: '请输入调用目标' }]}
          tooltip="调用目标字符串，可以是方法名或其他可执行的目标"
        >
          <Input placeholder="请输入调用目标" maxLength={500} />
        </Form.Item>

        <Form.Item
          name="cronExpression"
          label="Cron表达式"
          rules={[
            { required: true, message: '请输入Cron表达式' },
            {
              pattern: /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
              message: 'Cron表达式格式不正确',
            },
          ]}
          tooltip="Cron表达式格式: 秒 分 时 日 月 周"
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input placeholder="例如: 0 0 12 * * ?" style={{ width: 'calc(100% - 80px)' }} />
            <Button onClick={handleTestCron}>测试</Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="misfirePolicy"
          label="执行策略"
          rules={[{ required: true, message: '请选择执行策略' }]}
          tooltip="任务错过执行时间时的处理策略"
        >
          <Radio.Group options={misfirePolicyOptions} />
        </Form.Item>

        <Form.Item
          name="concurrent"
          label="并发执行"
          rules={[{ required: true, message: '请选择是否允许并发执行' }]}
          tooltip="是否允许多个任务实例同时运行"
        >
          <Radio.Group options={concurrentOptions} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择任务状态' }]}
        >
          <Radio.Group options={statusOptions} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={4} placeholder="请输入备注信息" maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScheduleJobForm;