import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Budget, BudgetQueryParams } from '@/modules/finance/types';
import { useBudgetManage } from './hooks/use-budget-manage';
import { getBudgetColumns } from './components/table-columns';
import FormModal from './components/form-modal';

/**
 * 预算管理页面组件
 * 实现预算的查询、新增、编辑、删除等功能
 */
const Budgets: React.FC = () => {
  const {
    tableRef,
    formModalProps,
    loadBudgetList,
    handleAddBudget,
    handleEditBudget,
    handleDeleteBudget
  } = useBudgetManage();

  // 获取表格列配置
  const columns = getBudgetColumns({
    handleEditBudget,
    handleDeleteBudget
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddBudget}>
      新增预算
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<Budget, BudgetQueryParams>
        headerTitle="预算列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadBudgetList}
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

export default Budgets;