import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Account, AccountQueryParams } from '@/modules/finance/types';
import { useAccountManage } from './hooks/use-account-manage';
import { getAccountColumns } from './components/table-columns';
import FormModal from './components/form-modal';
import AdjustBalanceModal from './components/adjust-balance-modal';

const Accounts: React.FC = () => {
  const {
    tableRef,
    formModalProps,
    adjustBalanceModalProps,
    loadAccountList,
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
    handleAdjustBalance
  } = useAccountManage();

  // 获取表格列配置
  const columns = getAccountColumns({
    handleEditAccount,
    handleDeleteAccount,
    handleAdjustBalance
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddAccount}>
      新增账户
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<Account, AccountQueryParams>
        headerTitle="账户列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadAccountList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10
        }}
        columns={columns}
      />

      <FormModal {...formModalProps} />
      <AdjustBalanceModal {...adjustBalanceModalProps} />
    </div>
  );
};

export default Accounts;