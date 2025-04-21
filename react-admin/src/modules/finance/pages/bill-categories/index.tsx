import React from 'react';
import { Button, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { BillCategory, BillCategoryQueryParams } from '@/modules/finance/types';
import { useBillCategoryManage } from './hooks/use-bill-category-manage';
import { getBillCategoryColumns } from './components/table-columns';
import FormModal from './components/form-modal';

const { TabPane } = Tabs;

const BillCategories: React.FC = () => {
  const {
    tableRef,
    currentCategoryType,
    formModalProps,
    loadBillCategoryList,
    handleAddBillCategory,
    handleEditBillCategory,
    handleDeleteBillCategory,
    handleTabChange
  } = useBillCategoryManage();

  // 获取表格列配置
  const columns = getBillCategoryColumns({
    handleEditBillCategory,
    handleDeleteBillCategory
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddBillCategory}>
      新增{currentCategoryType === 'income' ? '收入' : currentCategoryType === 'expense' ? '支出' : '转账'}分类
    </Button>
  ];

  return (
    <div className="page-container">
      <Tabs activeKey={currentCategoryType} onChange={handleTabChange}>
        <TabPane tab="收入分类" key="income">
          <ProTable<BillCategory, BillCategoryQueryParams>
            headerTitle="收入分类列表"
            actionRef={tableRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
              defaultCollapsed: false,
            }}
            cardBordered
            toolBarRender={toolBarRender}
            request={(params) => loadBillCategoryList({ ...params, type: 'income' })}
            pagination={{
              showSizeChanger: true,
              defaultPageSize: 10
            }}
            columns={columns}
          />
        </TabPane>
        <TabPane tab="支出分类" key="expense">
          <ProTable<BillCategory, BillCategoryQueryParams>
            headerTitle="支出分类列表"
            actionRef={tableRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
              defaultCollapsed: false,
            }}
            cardBordered
            toolBarRender={toolBarRender}
            request={(params) => loadBillCategoryList({ ...params, type: 'expense' })}
            pagination={{
              showSizeChanger: true,
              defaultPageSize: 10
            }}
            columns={columns}
          />
        </TabPane>
        <TabPane tab="转账分类" key="transfer">
          <ProTable<BillCategory, BillCategoryQueryParams>
            headerTitle="转账分类列表"
            actionRef={tableRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
              defaultCollapsed: false,
            }}
            cardBordered
            toolBarRender={toolBarRender}
            request={(params) => loadBillCategoryList({ ...params, type: 'transfer' })}
            pagination={{
              showSizeChanger: true,
              defaultPageSize: 10
            }}
            columns={columns}
          />
        </TabPane>
      </Tabs>

      <FormModal {...formModalProps} />
    </div>
  );
};

export default BillCategories;