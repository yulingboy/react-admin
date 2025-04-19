import { useEffect, useState } from 'react';
import { getDictionaryItemsByCode } from '@/api/dictionary';

// 定义缓存字典项的接口
interface CacheDictionaryItem {
  label: string;
  value: string;
  color?: string;
}

// 创建一个 Map 用于缓存字典数据
const DICT_MAP = new Map<string, CacheDictionaryItem[]>();

// 自定义 Hook，用于获取字典数据
export function useDictionary(code?: string) {
  // 初始化一个状态变量，用于存储字典数据
  const [options, setOptions] = useState<CacheDictionaryItem[]>([]);

  useEffect(() => {
    // 如果没有提供 code，直接返回
    if (!code) return;

    // 如果缓存中有数据，直接设置到状态中
    if (DICT_MAP.has(code)) {
      setOptions(DICT_MAP.get(code) || []);
      return;
    }

    // 定义一个异步函数来加载数据
    const loadData = async () => {

        // 调用 API 获取字典数据
        const data = await getDictionaryItemsByCode(code);
        // 处理数据，转换为需要的格式
        const processedOptions = data.map((item) => ({
          label: item.label,
          value: item.code,
          color: item.color,
        }));
        // 将处理后的数据存入缓存
        DICT_MAP.set(code, processedOptions);
        // 更新状态
        setOptions(processedOptions);
      
    };

    // 调用加载数据的函数
    loadData();
  }, [code]);

  // 定义类型
  type ValueEnum = Record<string, { text: string; color?: string }>;
  type LabelMap = Record<string, { label: string; color?: string }>;

  // 计算 valueEnum、selectOptions 和 labelMap
  const [valueEnum, setValueEnum] = useState<ValueEnum>({});
  const [selectOptions, setSelectOptions] = useState<{ label: string; value: string; color?: string }[]>([]);
  const [labelMap, setLabelMap] = useState<LabelMap>({});

  useEffect(() => {
    const newValueEnum = options.reduce((acc, item) => {
      acc[item.value] = { text: item.label, color: item.color };
      return acc;
    }, {} as ValueEnum);

    const newSelectOptions = options.map(item => ({
      label: item.label,
      value: item.value,
      color: item.color
    }));

    const newLabelMap = options.reduce((acc, item) => {
      acc[item.value] = { label: item.label, color: item.color };
      return acc;
    }, {} as LabelMap);

    setValueEnum(newValueEnum);
    setSelectOptions(newSelectOptions);
    setLabelMap(newLabelMap);
  }, [options]);

  // 返回三种不同格式的数据
  return {
    options,        // 原始数据
    valueEnum,      // 表格搜索枚举
    selectOptions,  // 表单选择器选项
    labelMap        // 值到标签的映射
  };
}

export default useDictionary;    