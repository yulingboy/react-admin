import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Select, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Alert, 
  Space, 
  Tag, 
  Descriptions 
} from 'antd';
import { ImportDataType, MappingConfigType } from '@/modules/finance/types';

const { Title, Text } = Typography;
const { Option } = Select;

// 字段映射步骤属性
interface MappingStepProps {
  isLoading: boolean;
  importData: ImportDataType | null;
  mappingConfig: MappingConfigType;
  handleMappingChange: (field: string, column: string) => void;
}

// 系统字段配置
const SYSTEM_FIELDS = [
  { field: 'type', label: '账单类型', required: true },
  { field: 'amount', label: '金额', required: true },
  { field: 'billDate', label: '账单日期', required: true },
  { field: 'accountName', label: '账户名称', required: true },
  { field: 'targetAccountName', label: '转入账户', required: false },
  { field: 'categoryName', label: '分类名称', required: false },
  { field: 'tagNames', label: '标签名称(可多个,逗号分隔)', required: false },
  { field: 'description', label: '描述', required: false },
];

const MappingStep: React.FC<MappingStepProps> = ({
  isLoading,
  importData,
  mappingConfig,
  handleMappingChange,
}) => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // 当导入数据变化时，更新预览数据
  useEffect(() => {
    if (importData && importData.data && importData.data.length > 0) {
      // 仅展示前5行作为预览
      setPreviewData(importData.data.slice(0, 5));
    }
  }, [importData]);
  
  // 未选择任何字段映射的列
  const unmappedColumns = importData?.headers.filter(
    header => !Object.values(mappingConfig).includes(header)
  ) || [];
  
  // 计算匹配状态
  const calculateMappingStatus = () => {
    const requiredFields = SYSTEM_FIELDS.filter(field => field.required).map(field => field.field);
    const mappedRequiredFields = requiredFields.filter(field => !!mappingConfig[field]);
    
    return {
      total: SYSTEM_FIELDS.length,
      mapped: Object.keys(mappingConfig).length,
      requiredTotal: requiredFields.length,
      requiredMapped: mappedRequiredFields.length,
      isReady: mappedRequiredFields.length === requiredFields.length
    };
  };
  
  const status = calculateMappingStatus();
  
  // 表格列配置
  const columns = importData?.headers.map(header => ({
    title: (
      <div style={{ textAlign: 'center' }}>
        <div>{header}</div>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder="映射到字段"
          value={Object.keys(mappingConfig).find(key => mappingConfig[key] === header) || undefined}
          onChange={(value) => handleMappingChange(value, header)}
          disabled={isLoading}
          allowClear
        >
          {SYSTEM_FIELDS.map(field => (
            <Option 
              key={field.field} 
              value={field.field}
              disabled={!!mappingConfig[field.field] && mappingConfig[field.field] !== header}
            >
              {field.label} {field.required ? '*' : ''}
            </Option>
          ))}
        </Select>
      </div>
    ),
    dataIndex: header,
    key: header,
    align: 'center' as const,
    ellipsis: true,
  })) || [];

  if (!importData || !importData.data || importData.data.length === 0) {
    return (
      <div>
        <Title level={4}>第二步：映射字段</Title>
        <Alert
          message="没有可用的数据"
          description="请先上传有效的数据文件"
          type="warning"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div>
      <Title level={4}>第二步：映射字段</Title>
      <Text type="secondary">
        请将导入文件中的列映射到系统字段，标有 * 的为必填字段，必须进行映射
      </Text>
      
      <Row gutter={16} style={{ marginTop: 16, marginBottom: 16 }}>
        <Col span={12}>
          <Card size="small" title="映射状态">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="已映射字段">
                <Space>
                  <Tag color={status.isReady ? 'success' : 'warning'}>
                    {status.mapped} / {status.total}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="必填字段">
                <Space>
                  <Tag color={status.requiredMapped === status.requiredTotal ? 'success' : 'error'}>
                    {status.requiredMapped} / {status.requiredTotal}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="准备状态">
                {status.isReady ? (
                  <Tag color="success">可以继续</Tag>
                ) : (
                  <Tag color="error">请完成必填字段映射</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="已映射字段">
            {Object.keys(mappingConfig).length > 0 ? (
              <ul className="pl-4">
                {Object.entries(mappingConfig).map(([field, column]) => {
                  const fieldConfig = SYSTEM_FIELDS.find(f => f.field === field);
                  return (
                    <li key={field}>
                      <Text strong>{fieldConfig?.label || field}</Text>: {column}
                      {fieldConfig?.required && <Text type="danger"> *</Text>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Text type="secondary">暂无映射字段</Text>
            )}
          </Card>
        </Col>
      </Row>
      
      <Alert
        message="数据预览和字段映射"
        description="下表显示导入数据的前5行，请根据内容将列头部的下拉框选择映射到对应的系统字段。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Table
        dataSource={previewData.map((item, index) => ({ ...item, key: index }))}
        columns={columns}
        size="small"
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
      />
    </div>
  );
};

export default MappingStep;