import { useState, useRef } from 'react';
import { message } from '@/hooks/useMessage';
import type { ActionType } from '@ant-design/pro-components';
import { Dictionary, DictionaryQueryParams } from '@/types/dictionary';
import { getDictionaryList, createDictionary, updateDictionary, deleteDictionary } from '@/api/dictionary';
import { formatTableData } from '@/utils/tableHelper';

export function useDictionaryManage() {
  // 表单弹窗可见性
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  // 表单弹窗标题
  const [formModalTitle, setFormModalTitle] = useState<string>('新增字典');
  // 当前编辑的记录
  const [currentRecord, setCurrentRecord] = useState<Dictionary | null>(null);
  // 表格引用
  const tableRef = useRef<ActionType | null>(null);

  // 处理新增
  const handleAdd = () => {
    setCurrentRecord(null);
    setFormModalTitle('新增字典');
    setFormModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: Dictionary) => {
    setCurrentRecord(record);
    setFormModalTitle('编辑字典');
    setFormModalVisible(true);
  };

  // 处理删除
  const handleDelete = (record: Dictionary) => {
    deleteDictionary(record.id)
      .then(() => {
        message.success('删除成功');
        // 刷新列表
        tableRef.current?.reload();
      })
      .catch(() => {
        message.error('删除失败');
      });
  };

  // 处理表单提交
  const handleFormModalSubmit = async (values: any) => {
    try {
      if (currentRecord) {
        // 更新
        await updateDictionary({
          ...values,
          id: currentRecord.id,
        });
        message.success('更新成功');
      } else {
        // 新增
        await createDictionary(values);
        message.success('新增成功');
      }
      // 关闭弹窗
      setFormModalVisible(false);
      // 刷新列表
      tableRef.current?.reload();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('操作失败');
    }
  };

  // 处理表单取消
  const handleFormModalCancel = () => {
    setFormModalVisible(false);
  };

  // 加载字典列表数据
  const loadDictionaryList = async (params: DictionaryQueryParams) => {
    const { current, pageSize, ...rest } = params;
    const queryParams = {
      page: current || 1,
      pageSize: pageSize || 10,
      ...rest
    };
    
    const response = await getDictionaryList(queryParams);
    return formatTableData<Dictionary>(response);
  };

  return {
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
  };
}