import React from 'react';
import { Table, Typography, Card, Row, Col, Alert, Statistic, Result, Progress, Spin } from 'antd';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { ImportResult } from '@/modules/finance/types';

const { Title, Text, Paragraph } = Typography;

// 确认步骤属性
interface ConfirmStepProps {
  isLoading: boolean;
  previewData: any[] | null;
  totalCount: number;
  importResult: ImportResult | null;
  handleImportConfirm: () => Promise<void>;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({
  isLoading,
  previewData,
  totalCount,
  importResult,
  handleImportConfirm,
}) => {
  // 生成预览表格列
  const generateColumns = () => {
    if (!previewData || previewData.length === 0) return [];

    return Object.keys(previewData[0]).map(key => ({
      title: key,
      dataIndex: key,
      key,
      ellipsis: true,
      width: 150,
    }));
  };

  // 渲染结果组件
  const renderResult = () => {
    if (importResult) {
      const { success, failed, total } = importResult;
      const successRate = total ? Math.round((success / total) * 100) : 0;

      return (
        <div className="result-container">
          <Result
            status={success > 0 ? "success" : "warning"}
            title="导入已完成"
            subTitle="以下是导入结果统计"
          />
          
          <Row gutter={16} justify="center" style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="总记录数"
                  value={total}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="成功导入"
                  value={success}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={<small>({successRate}%)</small>}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="导入失败"
                  value={failed}
                  valueStyle={{ color: failed > 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Progress percent={successRate} status={failed > 0 ? "exception" : "success"} />
          
          <Paragraph style={{ marginTop: 24 }}>
            {failed > 0 ? (
              <Alert
                message="部分数据导入失败"
                description="导入失败的原因可能是数据格式不符合要求，或者系统中不存在对应的账户、分类等。您可以下载导入报告查看详细错误信息。"
                type="warning"
                showIcon
              />
            ) : (
              <Alert
                message="数据全部导入成功"
                description="所有账单数据已成功导入到系统中。"
                type="success"
                showIcon
              />
            )}
          </Paragraph>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="loading-container" style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
          <p style={{ marginTop: 16 }}>正在导入数据，请稍候...</p>
        </div>
      );
    }
    
    return (
      <div>
        <Alert
          message="准备就绪"
          description={`系统将导入 ${totalCount} 条账单数据，请点击"导入确认"按钮开始导入。`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 16 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <p style={{ marginTop: 16 }}>点击底部的"导入确认"按钮开始导入</p>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <Title level={4}>第三步：确认导入</Title>
      
      {renderResult()}
      
      {!importResult && !isLoading && previewData && previewData.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>数据预览（前5条记录）</Title>
          <Table
            dataSource={previewData.map((item, index) => ({ ...item, key: index }))}
            columns={generateColumns()}
            size="small"
            pagination={false}
            scroll={{ x: 'max-content' }}
            bordered
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Text type="secondary">共 {totalCount} 条记录</Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmStep;