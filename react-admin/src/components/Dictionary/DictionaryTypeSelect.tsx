import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { getAllDictionaries } from '@/api/dictionary';
import { Dictionary } from '@/types/dictionary';
import { DictionaryTypeSelectProps } from '@/hooks/useDictionary';

/**
 * 字典类型下拉选择组件
 * 用于表单中选择字典类型，从后端获取所有可用的字典类型
 */
const DictionaryTypeSelect: React.FC<DictionaryTypeSelectProps> = ({
  value,
  placeholder = '请选择字典类型',
  allowClear = true,
  disabled = false,
  mode,
  onChange,
  style,
  ...restProps
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<{ value: string; label: string; isSystem?: string }[]>([]);

  useEffect(() => {
    const fetchDictionaries = async () => {
      setLoading(true);
      try {
        const response = await getAllDictionaries();
        console.log('获取字典类型:', response);
        
        const dictionaries: Dictionary[] = response || [];
        
        const formattedOptions = dictionaries.map(dict => ({
          value: dict.code,
          label: `${dict.name} (${dict.code})`,
          isSystem: dict.isSystem // 添加isSystem属性
        }));
        
        // 筛选并排序选项：系统字典(isSystem='1')在前，自定义字典在后
        const sortedOptions = [
          ...formattedOptions.filter(item => item.isSystem === '1'),
          ...formattedOptions.filter(item => item.isSystem !== '1')
        ];
        
        setOptions(sortedOptions);
      } catch (error) {
        console.error('获取字典类型失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDictionaries();
  }, []);

  return (
    <Select
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      loading={loading}
      value={value}
      onChange={onChange}
      mode={mode}
      style={{ width: '100%', ...style }}
      options={options}
      notFoundContent={loading ? <Spin size="small" /> : null}
      {...restProps}
    />
  );
};

export default DictionaryTypeSelect;