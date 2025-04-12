import { RequestData } from '@ant-design/pro-components';

/**
 * 将后端返回的数据转换为表格需要的数据格式
 * @param data 后端返回的数据
 * @returns 表格需要的数据格式
 */
export function formatTableData<T = any>(data: any): RequestData<T> {
  // 判断数据是否为空
  if (!data) {
    return {
      data: [],
      success: false,
      total: 0
    };
  }

  // 处理嵌套数据结构（如 response.data.data）
  const responseData = data.data || data;
  
  // 获取数据项列表（兼容多种后端返回格式）
  const items = responseData.items || responseData.list || responseData.records || responseData.data || [];
  
  // 获取总数（兼容多种后端返回格式）
  const total = 
    responseData.meta?.total ||  // NestJS 常用格式
    responseData.total ||        // 常见分页格式
    responseData.totalCount ||   // 某些后端API格式
    responseData.pagination?.total || // Ant Design Pro 格式
    items.length;                // 无分页时使用数组长度
    
  return {
    data: items,
    success: true,
    total: total
  };
}