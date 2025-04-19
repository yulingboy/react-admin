import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useDataList } from './hooks/use-data-list';
import { getTableColumns } from './config/table-columns';
import FormModal from './components/form-modal';
import type { User, ListParams } from '@/types/user'; // 导入正确的类型

const ListPage: React.FC = () => {
  const { tableRef, formModalProps, loadData, handleAdd, handleEdit, handleDelete, roleOptions } = useDataList();

  // 获取表格列配置
  const columns = getTableColumns({
    handleEdit,
    handleDelete,
    roleOptions
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
      新增
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<User, ListParams>
        headerTitle="用户列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        toolBarRender={toolBarRender}
        request={loadData}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10
        }}
        columns={columns}
        cardBordered
      />

      <FormModal {...formModalProps} roleOptions={roleOptions} />
    </div>
  );
};

export default ListPage;
