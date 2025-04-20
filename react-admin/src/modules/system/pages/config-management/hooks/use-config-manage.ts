import { useState, useRef, useCallback, useEffect } from 'react';
import type { ActionType } from '@ant-design/pro-components';

import { formatTableData } from '@/utils/tableHelper';
import { Config, ConfigListParams } from '@/modules/system/types/config';
import { message } from '@/hooks/useMessage';
import { deleteConfig, getConfigGroups, getConfigList } from '@/modules/system/api/config-api';

export const useConfigManage = () => {
  // 状态定义
  const [formVisible, setFormVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<Config | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const tableRef = useRef<ActionType | null>(null);

  // 加载配置分组选项
  const loadGroupOptions = useCallback(async () => {
    try {
      const data = await getConfigGroups();
      setGroupOptions(data || []);
    } catch (error) {
      console.error('加载配置分组失败', error);
      setGroupOptions([]);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadGroupOptions();
  }, [loadGroupOptions]);

  // 添加配置
  const handleAddConfig = useCallback(() => {
    setCurrentConfig(undefined);
    setIsEdit(false);
    setFormVisible(true);
  }, []);

  // 编辑配置
  const handleEditConfig = useCallback((record: Config) => {
    setCurrentConfig(record);
    setIsEdit(true);
    setFormVisible(true);
  }, []);

  // 删除配置
  const handleDeleteConfig = useCallback(async (id: number) => {
    try {
      await deleteConfig(id);
      message.success('配置删除成功');
      tableRef.current?.reload();
    } catch (error) {
      console.error('删除配置失败', error);
      message.error('删除配置失败');
    }
  }, []);

  // 表单提交成功回调
  const handleFormSuccess = useCallback(() => {
    setFormVisible(false);
    tableRef.current?.reload();
    loadGroupOptions(); // 重新加载分组选项，以防有新增分组
  }, [loadGroupOptions]);

  // 加载配置列表数据
  const loadConfigList = useCallback(async (params: ConfigListParams) => {
    try {
      const response = await getConfigList(params);
      return formatTableData<Config>(response);
    } catch (error) {
      console.error('加载配置列表失败', error);
      return { data: [], success: false, total: 0 };
    }
  }, []);

  // 封装表单模态框属性
  const formModalProps = {
    open: formVisible,
    onCancel: () => setFormVisible(false),
    onSuccess: handleFormSuccess,
    initialValues: currentConfig,
    isEdit: isEdit,
    groupOptions
  };

  return {
    tableRef,
    formModalProps,
    groupOptions,
    loadConfigList,
    handleAddConfig,
    handleEditConfig,
    handleDeleteConfig
  };
};