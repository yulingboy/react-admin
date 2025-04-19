import { useState, useRef } from 'react';
import { message } from '@/hooks/useMessage';
import type { ActionType } from '@ant-design/pro-components';
import { CodeGenerator, CodeGeneratorQueryParams, TableInfo } from '@/types/code-generator';
import { getCodeGeneratorList, createCodeGenerator, updateCodeGenerator, deleteCodeGenerator, getTableList, generateCode } from '@/api/code-generator';
import { formatTableData } from '@/utils/tableHelper';

export function useCodeGeneratorManage() {
  // 表单弹窗可见性
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  // 表单弹窗标题
  const [formModalTitle, setFormModalTitle] = useState<string>('新增代码生成配置');
  // 当前编辑的记录
  const [currentRecord, setCurrentRecord] = useState<CodeGenerator | null>(null);
  // 表格引用
  const tableRef = useRef<ActionType | null>(null);
  // 数据库表列表
  const [tableList, setTableList] = useState<TableInfo[]>([]);
  // 表列表加载状态
  const [loadingTables, setLoadingTables] = useState<boolean>(false);

  // 加载数据库表列表
  const loadTableList = async () => {
    setLoadingTables(true);
    try {
      const result = await getTableList();
      setTableList(result);
    } catch (error) {
      console.error('获取表列表失败:', error);
      message.error('获取表列表失败');
    } finally {
      setLoadingTables(false);
    }
  };

  // 处理新增
  const handleAdd = () => {
    // 加载表列表
    loadTableList();
    setCurrentRecord(null);
    setFormModalTitle('新增代码生成配置');
    setFormModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: CodeGenerator) => {
    // 加载表列表
    loadTableList();
    setCurrentRecord(record);
    setFormModalTitle('编辑代码生成配置');
    setFormModalVisible(true);
  };

  // 处理删除
  const handleDelete = (record: CodeGenerator) => {
    deleteCodeGenerator(record.id)
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
        await updateCodeGenerator(currentRecord.id, values);
        message.success('更新成功');
      } else {
        // 新增
        await createCodeGenerator(values);
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

  // 生成代码
  const handleGenerateCode = async (id: number) => {
    try {
      const response = await generateCode(id);

      // 创建Blob URL
      const blob = new Blob([response], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);

      // 创建临时下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-code.zip';
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('代码生成成功');
    } catch (error) {
      console.error('代码生成失败:', error);
      message.error('代码生成失败');
    }
  };

  // 加载代码生成器列表数据
  const loadCodeGeneratorList = async (params: CodeGeneratorQueryParams) => {
    const { current, pageSize, ...rest } = params;
    const queryParams = {
      page: current || 1,
      pageSize: pageSize || 10,
      ...rest
    };

    const response = await getCodeGeneratorList(queryParams);
    return formatTableData<CodeGenerator>(response);
  };

  return {
    formModalVisible,
    formModalTitle,
    currentRecord,
    tableRef,
    tableList,
    loadingTables,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormModalSubmit,
    handleFormModalCancel,
    handleGenerateCode,
    loadCodeGeneratorList
  };
}
