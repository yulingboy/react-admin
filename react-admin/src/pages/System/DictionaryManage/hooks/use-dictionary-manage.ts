import { useState, useRef } from 'react';
import { message } from '@/hooks/useMessage';
import type { ActionType } from '@ant-design/pro-components';
import { Dictionary, DictionaryQueryParams } from '@/types/dictionary';
import { getDictionaryList, createDictionary, updateDictionary, deleteDictionary } from '@/api/dictionary';
import { formatTableData } from '@/utils/tableHelper';

export function useDictionaryManage() {
  // 表单弹窗可见性
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  // 表单弹窗标题
  const [formModalTitle, setFormModalTitle] = useState<string>('新增字典');
  // 当前编辑的记录
  const [currentRecord, setCurrentRecord] = useState<Dictionary | null>(null);
  // 是否为编辑模式
  const [isEdit, setIsEdit] = useState<boolean>(false);
  // 表格引用
  const tableRef = useRef<ActionType | null>(null);

  // 处理新增
  const handleAddDictionary = () => {
    setCurrentRecord(null);
    setIsEdit(false);
    setFormModalTitle('新增字典');
    setFormModalOpen(true);
  };

  // 处理编辑
  const handleEditDictionary = (record: Dictionary) => {
    setCurrentRecord(record);
    setIsEdit(true);
    setFormModalTitle('编辑字典');
    setFormModalOpen(true);
  };

  // 处理删除
  const handleDeleteDictionary = (record: Dictionary) => {
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



  // 处理表单取消
  const handleFormModalCancel = () => {
    setFormModalOpen(false);
  };

  // 加载字典列表数据
  const loadDictionaryList = async (params: DictionaryQueryParams) => {
    
    const response = await getDictionaryList(params);
    return formatTableData<Dictionary>(response);
  };

  // 表单弹窗属性
  const formModalProps = {
    open: formModalOpen,
    title: formModalTitle,
    initialValues: currentRecord,
    isEdit,
    onCancel: handleFormModalCancel,
    onSuccess: () => {
      setFormModalOpen(false);
      tableRef.current?.reload();
    }
  };

  return {
    tableRef,
    formModalProps,
    loadDictionaryList,
    handleAddDictionary,
    handleEditDictionary,
    handleDeleteDictionary,
  };
}
