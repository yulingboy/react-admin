import { useEffect, useState, useMemo } from 'react';
import { getDictionaryItemsByCode } from '@/api/dictionary';
import { DictionaryItem } from '@/types/dictionary';

// 创建一个全局内存缓存
interface CacheItem {
  data: DictionaryItem[];
  expireAt: number;
}

const MEMORY_CACHE: Record<string, CacheItem> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存

/**
 * 字典数据hook，用于获取字典数据、格式化下拉选项和表格数据回填
 * @param code 字典编码，如果不传则不会加载数据
 * @param transform 是否转换数据格式为Select组件options格式，默认true
 * @param cache 是否缓存数据，默认true
 */
export function useDictionary(code?: string, transform: boolean = true, cache: boolean = true) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DictionaryItem[]>([]);

  // 字典数据缓存
  const dictCacheKey = `dict_${code}`;
  
  useEffect(() => {
    // 如果没有code则不加载数据
    if (!code) return;
    
    const loadData = async () => {
      // 如果开启缓存，先尝试从内存缓存中获取
      if (cache) {
        const cachedItem = MEMORY_CACHE[dictCacheKey];
        if (cachedItem) {
          // 检查缓存是否过期（1小时）
          const now = new Date().getTime();
          if (cachedItem.expireAt > now) {
            setItems(cachedItem.data);
            return;
          } else {
            // 缓存过期，删除
            delete MEMORY_CACHE[dictCacheKey];
          }
        }
      }
      
      // 没有缓存或缓存失效，从API加载
      setLoading(true);
      try {
        const data = await getDictionaryItemsByCode(code);
        setItems(data);
        
        // 如果开启缓存，将数据存入内存缓存，有效期1小时
        if (cache) {
          MEMORY_CACHE[dictCacheKey] = {
            data,
            expireAt: new Date().getTime() + CACHE_DURATION
          };
        }
      } catch (error) {
        console.error('获取字典数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [code, cache, dictCacheKey]);

  // 转换为Select组件可用的options格式
  const options = useMemo(() => {
    if (!transform) return items;
    
    return items.map(item => ({
      label: item.label,
      value: item.value,
      color: item.color,
      code: item.code,
      status: item.status,
      disabled: item.status !== '1' // 0表示禁用，1表示启用
    }));
  }, [items, transform]);

  /**
   * 通过值获取标签
   * @param value 字典值
   * @returns 对应的标签
   */
  const getLabelByValue = (value: string | number) => {
    const item = items.find(item => item.value === String(value));
    return item?.label || value;
  };

  /**
   * 通过值获取颜色
   * @param value 字典值
   * @returns 对应的颜色
   */
  const getColorByValue = (value: string | number) => {
    const item = items.find(item => item.value === String(value));
    return item?.color;
  };

  /**
   * 刷新字典数据
   */
  const refresh = async () => {
    if (!code) return;
    
    setLoading(true);
    try {
      const data = await getDictionaryItemsByCode(code);
      setItems(data);
      
      // 更新内存缓存
      if (cache) {
        MEMORY_CACHE[dictCacheKey] = {
          data,
          expireAt: new Date().getTime() + CACHE_DURATION
        };
      }
    } catch (error) {
      console.error('刷新字典数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 清除字典缓存
   */
  const clearCache = () => {
    if (code && cache) {
      delete MEMORY_CACHE[dictCacheKey];
    }
  };

  return {
    loading,
    items,
    options,
    getLabelByValue,
    getColorByValue,
    refresh,
    clearCache
  };
}

/**
 * 清除所有字典缓存
 */
export function clearAllDictionaryCache() {
  Object.keys(MEMORY_CACHE).forEach(key => {
    delete MEMORY_CACHE[key];
  });
}

// 字典标签组件类型定义
export interface DictionaryTagProps {
  code: string;
  value?: string | number;
  colorMapping?: Record<string, string>; // 自定义颜色映射
}

// 字典选择组件类型定义
export interface DictionarySelectProps {
  code: string;
  value?: string | number | (string | number)[];
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  mode?: 'multiple' | 'tags';
  onChange?: (value: any, option: any) => void;
  style?: React.CSSProperties;
}

/**
 * 字典选择组件Props
 */
export interface DictionaryTypeSelectProps {
  code?: string;
  value?: string | string[];
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  mode?: 'multiple' | 'tags';
  onChange?: (value: any, option: any) => void;
  style?: React.CSSProperties;
  [key: string]: any;
}

// 导出刷新函数
export const refreshDictionaryCache = (code?: string) => {
  if (code) {
    // 清除特定字典的缓存
    const dictCacheKey = `dict_${code}`;
    if (MEMORY_CACHE[dictCacheKey]) {
      delete MEMORY_CACHE[dictCacheKey];
    }
  } else {
    // 清除所有字典缓存
    Object.keys(MEMORY_CACHE).forEach(key => {
      if (key.startsWith('dict_')) {
        delete MEMORY_CACHE[key];
      }
    });
  }
};

// 用于实现字典搜索的类型
export interface DictionarySearchConfig {
  code: string;
  // 字典搜索配置，适用于ProTable的valueEnum
  getValueEnum: () => Record<string, { text: string; status?: string }>;
}