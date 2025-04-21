import React, { useState } from 'react';
import { Button, Card, Tabs, Tooltip, Space, Dropdown } from 'antd';
import { PlusOutlined, FilterOutlined, DownloadOutlined, UploadOutlined, EllipsisOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Bill, BillQueryParams } from '@/modules/finance/types';
import { useBillManage } from './hooks/use-bill-manage';
import { getBillColumns } from './components/table-columns';
import FormModal from './components/form-modal';
import AdvancedFilterDrawer from './components/advanced-filter-drawer';

const { TabPane } = Tabs;

const Bills: React.FC = () => {
  const {
    tableRef,
    currentBillType,
    formModalProps,
    filterDrawerProps,
    loadBillList,
    handleAddBill,
    handleEditBill,
    handleDeleteBill,
    handleTabChange,
    handleExportBills
  } = useBillManage();

  // 获取表格列配置
  const columns = getBillColumns({
    handleEditBill,
    handleDeleteBill
  });

  // 更多操作菜单
  const moreMenuItems = [
    {
      key: 'export',
      label: '导出账单',
      icon: <DownloadOutlined />,
      onClick: handleExportBills
    },
    {
      key: 'import',
      label: '导入账单',
      icon: <UploadOutlined />,
      onClick: () => window.location.href = '/finance/bill-imports'
    }
  ];

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button 
      key="filter" 
      icon={<FilterOutlined />} 
      onClick={() => filterDrawerProps.onOpen()}
    >
      高级筛选
    </Button>,
    <Dropdown
      key="more"
      menu={{
        items: moreMenuItems
      }}
    >
      <Button icon={<EllipsisOutlined />}>更多操作</Button>
    </Dropdown>,
    <Button 
      key="add" 
      type="primary" 
      icon={<PlusOutlined />} 
      onClick={handleAddBill}
    >
      新增{currentBillType === 'income' ? '收入' : currentBillType === 'expense' ? '支出' : '转账'}
    </Button>
  ];

  return (
    <div className="page-container">
      <Card bordered={false}>
        <Tabs activeKey={currentBillType} onChange={handleTabChange}>
          <TabPane tab="全部账单" key="all">
            <ProTable<Bill, BillQueryParams>
              headerTitle="账单记录"
              actionRef={tableRef}
              rowKey="id"
              search={{
                labelWidth: 'auto',
                defaultCollapsed: false,
              }}
              dateFormatter="string"
              toolBarRender={toolBarRender}
              request={(params) => loadBillList({ ...params, type: 'all' })}
              pagination={{
                showSizeChanger: true,
                defaultPageSize: 10
              }}
              columns={columns}
            />
          </TabPane>
          <TabPane tab="收入账单" key="income">
            <ProTable<Bill, BillQueryParams>
              headerTitle="收入记录"
              actionRef={tableRef}
              rowKey="id"
              search={{
                labelWidth: 'auto',
                defaultCollapsed: false,
              }}
              dateFormatter="string"
              toolBarRender={toolBarRender}
              request={(params) => loadBillList({ ...params, type: 'income' })}
              pagination={{
                showSizeChanger: true,
                defaultPageSize: 10
              }}
              columns={columns}
            />
          </TabPane>
          <TabPane tab="支出账单" key="expense">
            <ProTable<Bill, BillQueryParams>
              headerTitle="支出记录"
              actionRef={tableRef}
              rowKey="id"
              search={{
                labelWidth: 'auto',
                defaultCollapsed: false,
              }}
              dateFormatter="string"
              toolBarRender={toolBarRender}
              request={(params) => loadBillList({ ...params, type: 'expense' })}
              pagination={{
                showSizeChanger: true,
                defaultPageSize: 10
              }}
              columns={columns}
            />
          </TabPane>
          <TabPane tab="转账记录" key="transfer">
            <ProTable<Bill, BillQueryParams>
              headerTitle="转账记录"
              actionRef={tableRef}
              rowKey="id"
              search={{
                labelWidth: 'auto',
                defaultCollapsed: false,
              }}
              dateFormatter="string"
              toolBarRender={toolBarRender}
              request={(params) => loadBillList({ ...params, type: 'transfer' })}
              pagination={{
                showSizeChanger: true,
                defaultPageSize: 10
              }}
              columns={columns}
            />
          </TabPane>
        </Tabs>
      </Card>

      <FormModal {...formModalProps} />
      <AdvancedFilterDrawer {...filterDrawerProps} />
    </div>
  );
};

export default Bills;