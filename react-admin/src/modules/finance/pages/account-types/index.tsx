import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { AccountType, AccountTypeQueryParams } from '@/modules/finance/types';
import { useAccountTypeManage } from './hooks/use-account-type-manage';
import { getAccountTypeColumns } from './components/table-columns';
import FormModal from './components/form-modal';

const AccountTypes: React.FC = () => {
  const { tableRef, formModalProps, loadAccountTypeList, handleAddAccountType, handleEditAccountType, handleDeleteAccountType } = useAccountTypeManage();

  // 获取表格列配置
  const columns = getAccountTypeColumns({
    handleEditAccountType,
    handleDeleteAccountType
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddAccountType}>
      新增账户类型
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<AccountType, AccountTypeQueryParams>
        headerTitle="账户类型列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadAccountTypeList}
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

export default AccountTypes;