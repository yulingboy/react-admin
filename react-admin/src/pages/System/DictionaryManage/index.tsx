import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Dictionary, DictionaryQueryParams } from '@/types/dictionary';
import { useDictionaryManage } from './hooks/useDictionaryManage';
import DictionaryFormModal from './components/DictionaryFormModal';
import DictionaryItemsPanel from './components/DictionaryItemsPanel';
import { getDictionaryColumns } from './components/DictionaryColumns';

const DictionaryManage: React.FC = () => {
  // 当前选中的字典ID
  const [selectedDictionary, setSelectedDictionary] = useState<number | null>(null);
  // 当前选中的字典名称（用于抽屉标题）
  const [selectedDictionaryName, setSelectedDictionaryName] = useState<string>('');
  // 抽屉可见性
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  // 使用自定义Hook处理逻辑
  const {
    formModalVisible,
    formModalTitle,
    currentRecord,
    tableRef,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormModalSubmit,
    handleFormModalCancel,
    loadDictionaryList
  } = useDictionaryManage();

  // 处理查看字典项
  const handleViewDictionaryItems = (record: Dictionary) => {
    setSelectedDictionary(record.id);
    setSelectedDictionaryName(record.name);
    setDrawerVisible(true);
  };

  // 获取表格列配置
  const columns = getDictionaryColumns({
    handleEdit,
    handleDelete,
    handleSelect: handleViewDictionaryItems
  });

  // 关闭抽屉
  const closeDrawer = () => {
    setDrawerVisible(false);
    // 可选：清空选中的字典
    // setSelectedDictionary(null);
  };

  return (
    <div className="dictionary-manage">
      <ProTable<Dictionary, DictionaryQueryParams>
        headerTitle="字典管理"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        cardBordered
        toolBarRender={() => [
          <Button 
            key="add" 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增字典
          </Button>,
        ]}
        request={loadDictionaryList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        columns={columns}
      />

      {/* 字典项抽屉 */}
      <Drawer
        title={`字典项管理 - ${selectedDictionaryName}`}
        width={1200}
        open={drawerVisible}
        onClose={closeDrawer}
        destroyOnClose
      >
        {selectedDictionary && (
          <DictionaryItemsPanel dictionaryId={selectedDictionary} />
        )}
      </Drawer>

      {/* 字典添加/编辑表单弹窗 */}
      <DictionaryFormModal
        title={formModalTitle}
        visible={formModalVisible}
        onCancel={handleFormModalCancel}
        onSubmit={handleFormModalSubmit}
        record={currentRecord}
      />
    </div>
  );
};

export default DictionaryManage;