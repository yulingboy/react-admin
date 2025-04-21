import React, { useState } from 'react';
import { useBillImport } from './hooks/use-bill-import';
import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, 
  Steps, 
  Button, 
  Space, 
  Divider,
  Alert,
  Result
} from 'antd';
import { 
  CloudUploadOutlined, 
  ColumnHeightOutlined, 
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import UploadStep from './components/upload-step';
import MappingStep from './components/mapping-step';
import ConfirmStep from './components/confirm-step';

/**
 * 账单导入页面
 */
const BillImport: React.FC = () => {
  // 使用导入钩子
  const {
    importFile,
    importData,
    mappingConfig,
    isLoading,
    importResult,
    previewData,
    totalCount,
    handleFileUpload,
    handleMappingChange,
    preparePreviewData,
    handleImportConfirm,
    resetImport,
  } = useBillImport();

  // 当前步骤
  const [currentStep, setCurrentStep] = useState<number>(0);

  // 步骤项
  const steps = [
    {
      title: '上传文件',
      icon: <CloudUploadOutlined />,
      content: (
        <UploadStep
          importFile={importFile}
          isLoading={isLoading}
          handleFileUpload={handleFileUpload}
        />
      ),
      description: '上传Excel或CSV文件'
    },
    {
      title: '映射字段',
      icon: <ColumnHeightOutlined />,
      content: (
        <MappingStep
          isLoading={isLoading}
          importData={importData}
          mappingConfig={mappingConfig}
          handleMappingChange={handleMappingChange}
        />
      ),
      description: '将文件列映射到系统字段'
    },
    {
      title: '确认导入',
      icon: <CheckCircleOutlined />,
      content: (
        <ConfirmStep
          isLoading={isLoading}
          previewData={previewData}
          totalCount={totalCount}
          importResult={importResult}
          handleImportConfirm={handleImportConfirm}
        />
      ),
      description: '检查并确认导入数据'
    },
  ];

  // 检查是否可以进入下一步
  const canProceedNext = (): boolean => {
    switch (currentStep) {
      case 0: // 上传文件
        return !!importData && importData.data.length > 0;
      case 1: // 映射字段
        // 检查必填字段是否已映射
        const requiredFields = ['type', 'amount', 'billDate', 'accountName'];
        return requiredFields.every(field => !!mappingConfig[field]);
      case 2: // 确认导入
        return true;
      default:
        return false;
    }
  };

  // 处理下一步
  const handleNext = async () => {
    if (currentStep === 1) {
      // 从映射字段到确认导入，需要准备预览数据
      await preparePreviewData();
    }
    setCurrentStep(currentStep + 1);
  };

  // 处理上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 处理重置
  const handleReset = () => {
    resetImport();
    setCurrentStep(0);
  };

  // 渲染底部按钮
  const renderFooter = () => {
    if (importResult) {
      return (
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={handleReset}
        >
          开始新导入
        </Button>
      );
    }

    return (
      <Space>
        {currentStep > 0 && (
          <Button onClick={handlePrev} disabled={isLoading}>
            上一步
          </Button>
        )}
        
        {currentStep < steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={handleNext} 
            disabled={!canProceedNext() || isLoading}
          >
            下一步
          </Button>
        )}
        
        {currentStep === steps.length - 1 && !importResult && (
          <Button 
            type="primary" 
            onClick={handleImportConfirm} 
            loading={isLoading}
            disabled={!canProceedNext()}
          >
            确认导入
          </Button>
        )}
      </Space>
    );
  };

  // 渲染导入指南
  const renderGuide = () => {
    return (
      <Alert
        message="账单导入指南"
        description={
          <ul className="ml-4">
            <li>支持导入Excel(.xlsx/.xls)和CSV(.csv)格式的文件</li>
            <li>文件第一行必须是列头，用于映射到系统字段</li>
            <li>必须包含账单类型、金额、日期和账户等基本信息</li>
            <li>账单类型必须是：收入、支出或转账</li>
            <li>金额必须是有效的数字格式</li>
            <li>日期必须是有效的日期格式，如2023-01-01或01/01/2023</li>
            <li>账户名称必须在系统中已存在，否则导入会失败</li>
            <li>可以下载导入模板作为参考</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  };

  return (
    <PageContainer
      header={{
        title: '账单导入',
        subTitle: '批量导入账单数据',
      }}
    >
      {renderGuide()}
      
      <Card>
        <Steps
          current={currentStep}
          items={steps.map(step => ({
            title: step.title,
            icon: step.icon,
            description: step.description,
          }))}
        />
        
        <Divider />
        
        <div className="step-content" style={{ minHeight: 400, padding: '24px 0' }}>
          {steps[currentStep].content}
        </div>
        
        <Divider />
        
        <div className="step-footer" style={{ textAlign: 'center' }}>
          {renderFooter()}
        </div>
      </Card>
    </PageContainer>
  );
};

export default BillImport;