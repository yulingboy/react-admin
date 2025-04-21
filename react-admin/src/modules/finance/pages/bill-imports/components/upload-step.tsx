import React from 'react';
import { 
  Upload, 
  Button, 
  Space, 
  Typography, 
  Card,
  Empty
} from 'antd';
import { 
  InboxOutlined, 
  FileExcelOutlined, 
  DownloadOutlined 
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ImportFile } from '../hooks/use-bill-import';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

interface UploadStepProps {
  importFile: ImportFile | null;
  isLoading: boolean;
  handleFileUpload: (file: File) => Promise<void>;
}

/**
 * 账单导入-上传步骤组件
 */
const UploadStep: React.FC<UploadStepProps> = ({
  importFile,
  isLoading,
  handleFileUpload,
}) => {
  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      // 检查文件类型
      const isValidType = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ].includes(file.type);
      
      if (!isValidType) {
        // 自己处理上传，阻止组件默认上传行为
        return Upload.LIST_IGNORE;
      }
      
      // 调用处理函数
      handleFileUpload(file);
      
      // 自己处理上传，阻止组件默认上传行为
      return false;
    },
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    // 这里应该调用API下载模板
    // 暂时使用一个假链接
    const link = document.createElement('a');
    link.href = '/api/finance/bills/import/template';
    link.download = '账单导入模板.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 渲染已上传文件信息
  const renderFileInfo = () => {
    if (!importFile) return null;
    
    return (
      <Card className="mt-4 bg-gray-50">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <div>
              <div className="text-lg font-medium">{importFile.name}</div>
              <div className="text-gray-500">
                {(importFile.size / 1024).toFixed(2)} KB | 
                {importFile.type === 'csv' ? ' CSV文件' : ' Excel文件'}
              </div>
            </div>
          </Space>
          
          <div>
            <Text strong>数据预览：</Text>
            {importFile.preview && (
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {importFile.preview.headers.map((header, index) => (
                        <th 
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importFile.preview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-3 py-2 whitespace-nowrap text-sm text-gray-800"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-3">
              <Text type="secondary">
                共 {importFile.totalRows} 行数据，第1行为标题行
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="text-center">
          <Title level={4}>上传账单文件</Title>
          <Paragraph type="secondary">
            支持 Excel(.xlsx/.xls) 和 CSV(.csv) 格式的文件
          </Paragraph>
        </div>
        
        <Dragger {...uploadProps} disabled={isLoading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            请确保文件的第一行包含列标题，用于后续的字段映射
          </p>
        </Dragger>
        
        <div className="text-center">
          <Button 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
          >
            下载导入模板
          </Button>
        </div>
        
        {importFile ? renderFileInfo() : (
          <Empty 
            description="暂无上传文件" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )}
      </Space>
    </div>
  );
};

export default UploadStep;