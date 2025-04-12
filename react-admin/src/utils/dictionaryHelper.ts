import { useState, useEffect, createElement, useMemo } from 'react';
import { getDictionaryItemsByCode } from '@/api/dictionary';
import { DictionaryItem } from '@/types/dictionary';
// 直接导入DictionaryTag组件，避免在渲染时动态导入
import DictionaryTag from '@/components/Dictionary/DictionaryTag';
import { useDictionary } from '@/hooks/useDictionary';

/**
 * 获取字典项的valueEnum对象
 * @param items 字典项数据
 * @returns valueEnum对象
 */
export function convertItemsToValueEnum(items: DictionaryItem[]): Record<string, { text: string; status?: string }> {
    return items.reduce((acc, item) => {
        // 状态值为0的字典项不添加到下拉选择中
        acc[item.value] = {
            text: item.label,
            status: item.color || undefined
        };
        return acc;
    }, {} as Record<string, { text: string; status?: string }>);
}

/**
 * 获取字典的valueEnum函数，用于ProTable列表组件的搜索框
 * 返回一个自定义Hook，加载并返回字典的valueEnum
 * @param code 字典编码
 */
export function useDictionaryEnum(code: string) {
    // 使用useDictionary hook获取字典数据，利用其缓存机制
    const { items } = useDictionary(code, false);
    
    // 使用useMemo转换为valueEnum格式，避免不必要的计算
    const valueEnum = useMemo(() => {
        return convertItemsToValueEnum(items);
    }, [items]);

    return valueEnum;
}

/**
 * 自定义渲染器工厂函数 - 用于表格中渲染字典标签
 * 支持两种使用方式：
 * 1. 作为ProTable的render函数: render: createDictionaryRenderer('sys_common_status')
 * 2. 手动传入value: createDictionaryRenderer('sys_common_status', undefined)('1')
 * 
 * @param code 字典编码
 * @param value 字典值
 * @param colorMapping 可选的颜色映射，如果不提供则使用字典项自身的颜色值
 */
export function createDictionaryRenderer(code: string, value: string, colorMapping?: Record<string, string>) {
    return createElement(DictionaryTag, {
        code,
        value,
        ...(colorMapping ? { colorMapping } : {})
    });
}

/**
 * 获取字典项的label通过value
 * @param items 字典项列表
 * @param value 值
 * @returns 对应的标签
 */
export function getDictionaryLabel(items: DictionaryItem[], value: string | number) {
    const item = items.find(item => item.value === String(value));
    return item?.label || value;
}

/**
 * 获取字典项的color通过value
 * @param items 字典项列表
 * @param value 值
 * @returns 对应的颜色
 */
export function getDictionaryColor(items: DictionaryItem[], value: string | number) {
    const item = items.find(item => item.value === String(value));
    return item?.color;
}