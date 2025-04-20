import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Config, ConfigListParams } from '@/modules/system/types/config';
import { useConfigManage } from './hooks/use-config-manage';
import { getTableColumns } from './components/table-columns';
import FormModal from './components/form-modal';

const ConfigManage: React.FC = () => {
  const { 
    tableRef, 
    formModalProps, 
    groupOptions,
    loadConfigList, 
    handleAddConfig, 
    handleEditConfig, 
    handleDeleteConfig 
  } = useConfigManage();

  // 获取表格列配置
  const columns = getTableColumns({
    handleEdit: handleEditConfig,
    handleDelete: handleDeleteConfig,
    groupOptions
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddConfig}>
      新增配置
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<Config, ConfigListParams>
        headerTitle="配置列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadConfigList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10
        }}
        columns={columns}
      />

      <FormModal {...formModalProps} />
    </div>
  );
};

export default ConfigManage;