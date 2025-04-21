import { useState, useEffect } from 'react';
import { message } from 'antd';
import { BillCategory } from '../types';

// 模拟API调用获取分类数据
// TODO: 替换为实际API调用，当账单分类API实现后
const fetchCategories = async (): Promise<BillCategory[]> => {
  // 模拟请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 返回模拟数据
  return [
    { id: 1, name: '餐饮', type: 'expense', createdAt: '', updatedAt: '' },
    { id: 2, name: '交通', type: 'expense', createdAt: '', updatedAt: '' },
    { id: 3, name: '购物', type: 'expense', createdAt: '', updatedAt: '' },
    { id: 4, name: '娱乐', type: 'expense', createdAt: '', updatedAt: '' },
    { id: 5, name: '居家', type: 'expense', createdAt: '', updatedAt: '' },
    { id: 6, name: '工资', type: 'income', createdAt: '', updatedAt: '' },
    { id: 7, name: '奖金', type: 'income', createdAt: '', updatedAt: '' },
    { id: 8, name: '投资收益', type: 'income', createdAt: '', updatedAt: '' }
  ];
};

/**
 * 账单分类Hook
 * 用于获取和管理账单分类列表
 */
export const useCategories = (type?: 'income' | 'expense' | 'transfer') => {
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        
        // 如果指定了类型，则过滤
        const filteredData = type ? data.filter(item => item.type === type) : data;
        setCategories(filteredData);
      } catch (error) {
        console.error('获取账单分类失败:', error);
        message.error('获取账单分类失败');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [type]);

  return {
    categories,
    loading,
    // 提供刷新分类列表的方法
    refresh: async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        const filteredData = type ? data.filter(item => item.type === type) : data;
        setCategories(filteredData);
      } catch (error) {
        console.error('刷新账单分类失败:', error);
        message.error('刷新账单分类失败');
      } finally {
        setLoading(false);
      }
    }
  };
};