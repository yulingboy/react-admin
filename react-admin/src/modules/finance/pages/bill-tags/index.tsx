import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { BillTag, BillTagQueryParams } from '@/modules/finance/types';
import { useBillTagManage } from './hooks/use-bill-tag-manage';
import { getBillTagColumns } from './components/table-columns';
import FormModal from './components/form-modal';

const BillTags: React.FC = () => {
  const {
    tableRef,
    formModalProps,
    loadBillTagList,
    handleAddBillTag,
    handleEditBillTag,
    handleDeleteBillTag
  } = useBillTagManage();

  // 获取表格列配置
  const columns = getBillTagColumns({
    handleEditBillTag,
    handleDeleteBillTag
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddBillTag}>
      新增标签
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<BillTag, BillTagQueryParams>
        headerTitle="账单标签列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadBillTagList}
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

export default BillTags;