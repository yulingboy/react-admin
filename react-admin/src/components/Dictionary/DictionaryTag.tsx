import React from 'react';
import { Tag, Spin } from 'antd';
import { useDictionary, DictionaryTagProps } from '@/hooks/useDictionary';

/**
 * 字典标签组件
 * 用于显示带颜色的字典标签
 */
const DictionaryTag: React.FC<DictionaryTagProps> = ({
  code,
  value,
  colorMapping
}) => {
  const { loading, items } = useDictionary(code);
  
  // 如果没有值，则不显示标签
  if (!value && value !== 0) {
    return <span>-</span>;
  }
  
  // 如果正在加载，显示加载中状态
  if (loading) {
    return <Spin size="small" />;
  }
  
  // 查找对应的字典项
  const item = items.find(item => item.value === String(value));
  console.log('item', item);
  
  if (!item) {
    return <span>{value}</span>;
  }
  
  // 直接使用字典项的颜色，如果有指定colorMapping则优先使用
  const color = colorMapping?.[item.value] || item.color;
  
  return (
    <Tag color={color}>
      {item.label}
    </Tag>
  );
};

export default DictionaryTag;