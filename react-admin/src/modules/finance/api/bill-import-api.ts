/**
 * 账单导入相关API
 */
import request from '@/utils/http';
import { 
  BillImport, 
  BillImportFormData, 
  BillImportQueryParams, 
  BillImportListResult,
  ImportDataType,
  ImportResult
} from '../types';

/**
 * 分页获取账单导入记录列表
 * @param params 查询参数
 */
export const getBillImportList = (params: BillImportQueryParams) => {
  return request.get<BillImportListResult>('/api/finance/bill-imports/list', { params });
};

/**
 * 获取账单导入记录详情
 * @param id 导入记录ID
 */
export const getBillImportDetail = (id: number) => {
  return request.get<BillImport>('/api/finance/bill-imports/detail', { params: { id } });
};

/**
 * 上传账单文件进行导入
 * @param data 导入数据
 */
export const importBills = (data: BillImportFormData) => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('fileType', data.fileType);
  
  if (data.mappingConfig) {
    formData.append('mappingConfig', JSON.stringify(data.mappingConfig));
  }
  
  return request.post<BillImport>('/api/finance/bill-imports/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取导入进度
 * @param id 导入任务ID
 */
export const getImportProgress = (id: number) => {
  return request.get<{
    id: number;
    status: string;
    progress: number;
    successCount: number;
    failCount: number;
    totalCount: number;
  }>('/api/finance/bill-imports/progress', { params: { id } });
};

/**
 * 取消导入任务
 * @param id 导入任务ID
 */
export const cancelImport = (id: number) => {
  return request.post('/api/finance/bill-imports/cancel', { id });
};

/**
 * 删除导入任务记录
 * @param id 导入任务ID
 */
export const deleteBillImport = (id: number) => {
  return request.delete('/api/finance/bill-imports/delete', { params: { id } });
};

/**
 * 获取导入模板
 * @param fileType 文件类型
 */
export const getImportTemplate = (fileType: string) => {
  return request.download('/api/finance/bill-imports/template', { fileType }, `${fileType}-template.xlsx`);
};

/**
 * 解析导入文件
 * @param formData 包含文件的FormData对象
 * @returns 解析后的数据，包含表头和数据内容
 */
export const parseImportFile = (formData: FormData) => {
  return request.post<ImportDataType>('/api/finance/bill-imports/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 映射导入数据
 * @param data 包含原始数据和映射配置的请求体
 * @returns 映射后的预览数据
 */
export const mapImportData = (data: {
  data: any[];
  mappingConfig: Record<string, string>;
}) => {
  return request.post<{
    data: any[];
    totalCount: number;
  }>('/api/finance/bill-imports/map', data);
};