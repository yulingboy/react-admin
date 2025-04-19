import React, { useState, useEffect } from 'react';
import { Button, message as antMessage } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { CodeGenerator } from '@/types/code-generator';
import { useCodeGeneratorManage } from './hooks/useCodeGeneratorManage';
import { getCodeGeneratorColumns } from './components/CodeGeneratorColumns';
import CodeGeneratorFormModal from './components/CodeGeneratorFormModal';
import CodePreviewModal from './components/CodePreviewModal';
import ColumnConfigPanel from './components/ColumnConfigPanel';
import { getCodeGenerator } from '@/api/code-generator';

const CodeGeneratorPage: React.FC = () => {
  // 使用自定义Hook处理逻辑
  const {
    formModalVisible,
    formModalTitle,
    currentRecord,
    tableRef,
    tableList,
    loadingTables,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormModalSubmit,
    handleFormModalCancel,
    handleGenerateCode,
    loadCodeGeneratorList
  } = useCodeGeneratorManage();

  // 预览弹窗状态
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewId, setPreviewId] = useState<number | null>(null);

  // 配置面板状态
  const [configPanelVisible, setConfigPanelVisible] = useState<boolean>(false);
  const [configId, setConfigId] = useState<number | null>(null);
  const [columnsData, setColumnsData] = useState<any[]>([]);

  // 处理预览代码
  const handlePreview = (record: CodeGenerator) => {
    setPreviewId(record.id);
    setPreviewVisible(true);
  };

  // 处理配置
  const handleConfig = async (record: CodeGenerator) => {
    try {
      const result = await getCodeGenerator(record.id);
      setColumnsData(result.columns);
      setConfigId(record.id);
      setConfigPanelVisible(true);
    } catch (error) {
      console.error('获取配置失败:', error);
      antMessage.error('获取配置失败');
    }
  };

  // 同步表列完成后刷新数据
  const handleSyncComplete = async () => {
    if (configId) {
      try {
        const result = await getCodeGenerator(configId);
        setColumnsData(result.columns);
      } catch (error) {
        console.error('刷新配置失败:', error);
        antMessage.error('刷新配置失败');
      }
    }
  };

  // 获取表格列配置
  const columns = getCodeGeneratorColumns({
    handleEdit,
    handleDelete,
    handlePreview,
    handleGenerate: record => handleGenerateCode(record.id),
    handleConfig
  });

  return (
    <div className="code-generator-page">
      <ProTable<CodeGenerator>
        headerTitle="代码生成器"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 120
        }}
        cardBordered
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增生成配置
          </Button>
        ]}
        request={loadCodeGeneratorList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10
        }}
        columns={columns}
      />

      {/* 代码生成器表单 */}
      <CodeGeneratorFormModal
        title={formModalTitle}
        visible={formModalVisible}
        onCancel={handleFormModalCancel}
        onSubmit={handleFormModalSubmit}
        record={currentRecord}
        tableList={tableList}
        loadingTables={loadingTables}
      />

      {/* 代码预览 */}
      <CodePreviewModal visible={previewVisible} generatorId={previewId} onCancel={() => setPreviewVisible(false)} />

      {/* 字段配置 */}
      <ColumnConfigPanel
        visible={configPanelVisible}
        generatorId={configId}
        columns={columnsData}
        onClose={() => setConfigPanelVisible(false)}
        onSync={handleSyncComplete}
      />
    </div>
  );
};

export default CodeGeneratorPage;
