/**
 * 财务模块类型定义文件
 */

// 基础分页查询参数接口
export interface BaseQueryParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

// 账户类型接口
export interface AccountType {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 账户类型查询参数
export interface AccountTypeQueryParams extends BaseQueryParams {
  name?: string;
}

// 账户接口
export interface Account {
  id: number;
  name: string;
  typeId: number;
  typeName?: string;
  balance: number;
  initialBalance: number;
  icon?: string;
  color?: string;
  includeInStats: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 账户查询参数
export interface AccountQueryParams extends BaseQueryParams {
  name?: string;
  typeId?: number;
  includeInStats?: boolean;
}

// 账单分类接口
export interface BillCategory {
  id: number;
  name: string;
  parentId?: number;
  type: 'income' | 'expense' | 'transfer';
  icon?: string;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 账单分类查询参数
export interface BillCategoryQueryParams extends BaseQueryParams {
  name?: string;
  type?: 'income' | 'expense' | 'transfer';
  parentId?: number;
}

// 账单标签接口
export interface BillTag {
  id: number;
  name: string;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 账单标签查询参数
export interface BillTagQueryParams extends BaseQueryParams {
  name?: string;
}

// 账单接口
export interface Bill {
  id: number;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: number;
  categoryName?: string;
  accountId: number;
  accountName?: string;
  transferToAccountId?: number;
  transferToAccountName?: string;
  billDate: string;
  tags?: number[] | BillTag[];
  description?: string;
  attachments?: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// 账单查询参数
export interface BillQueryParams extends BaseQueryParams {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: number;
  accountId?: number;
  tagIds?: number[];
  minAmount?: number;
  maxAmount?: number;
  description?: string;
}

// 预算接口
export interface Budget {
  id: number;
  name: string;
  type: 'monthly' | 'yearly' | 'custom';
  amount: number;
  usedAmount: number;
  categoryId?: number;
  categoryName?: string;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 预算查询参数
export interface BudgetQueryParams extends BaseQueryParams {
  name?: string;
  type?: 'monthly' | 'yearly' | 'custom';
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

// 账单导入数据类型
export interface ImportDataType {
  headers: string[];  // 文件表头
  data: any[];        // 导入的原始数据
  fileType?: 'csv' | 'excel' | 'txt'; // 文件类型
}

// 字段映射配置类型
export interface MappingConfigType {
  [key: string]: string; // 系统字段名: 导入文件的列名
}

// 导入结果类型
export interface ImportResult {
  success: number;    // 成功导入的记录数
  failed: number;     // 失败的记录数
  errorMessages?: string[]; // 错误信息
  data?: any[];       // 已导入的数据
}

// 账单导入表单数据
export interface BillImportFormData {
  mappingConfig: MappingConfigType;
  data: any[];
  file?: File;
  fileType?: string;
}

// 账单导入查询参数
export interface BillImportQueryParams extends BaseQueryParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  fileType?: string;
}

// 账单导入列表结果
export interface BillImportListResult {
  items: BillImport[];
  total: number;
}

// 账单导入记录
export interface BillImport {
  id: number;
  fileName: string;
  fileType: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  importDate: string;
  status: string;
  errorLog?: string;
  createdAt: string;
  updatedAt: string;
}