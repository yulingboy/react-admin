/**
 * 记账理财模块类型定义
 */

import { PaginationParams } from '@/types/pagination';

/**
 * 通用状态类型
 */
export type Status = '0' | '1';
export type IsSystem = '0' | '1';
export type IsDefault = '0' | '1';

/**
 * 账户类型
 */
export interface AccountType {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  status: Status;
  isSystem: IsSystem;
  sort: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 账户类型查询参数
 */
export interface AccountTypeQueryParams extends PaginationParams {
  keyword?: string;
  status?: Status;
  isSystem?: IsSystem;
}

/**
 * 账户类型表单数据
 */
export interface AccountTypeFormData {
  id?: number;
  name: string;
  icon?: string;
  description?: string;
  status: Status;
  isSystem: IsSystem;
  sort: number;
}

/**
 * 账户
 */
export interface Account {
  id: number;
  name: string;
  typeId: number;
  balance: number;
  icon?: string;
  color?: string;
  userId: number;
  status: Status;
  isDefault: IsDefault;
  sort: number;
  createdAt: string;
  updatedAt?: string;
  type?: {
    name: string;
    icon?: string;
  };
}

/**
 * 账户查询参数
 */
export interface AccountQueryParams extends PaginationParams {
  keyword?: string;
  typeId?: number;
  status?: Status;
  isDefault?: IsDefault;
}

/**
 * 账户表单数据
 */
export interface AccountFormData {
  id?: number;
  name: string;
  typeId: number;
  balance: number;
  icon?: string;
  color?: string;
  status: Status;
  isDefault: IsDefault;
  sort: number;
}

/**
 * 账户余额调整数据
 */
export interface AdjustBalanceData {
  id: number;
  balance: number;
  reason?: string;
}

/**
 * 账单分类
 */
export interface BillCategory {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  icon?: string;
  color?: string;
  parentId: number;
  userId?: number;
  status: Status;
  isSystem: IsSystem;
  sort: number;
  createdAt: string;
  updatedAt?: string;
  billCount?: number;
  parent?: {
    id: number;
    name: string;
  };
  children?: BillCategory[];
}

/**
 * 账单分类查询参数
 */
export interface BillCategoryQueryParams extends PaginationParams {
  keyword?: string;
  type?: string;
  status?: Status;
  isSystem?: IsSystem;
  parentId?: number;
}

/**
 * 账单分类表单数据
 */
export interface BillCategoryFormData {
  id?: number;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  icon?: string;
  color?: string;
  parentId: number;
  status: Status;
  isSystem: IsSystem;
  sort: number;
}

/**
 * 账单标签
 */
export interface BillTag {
  id: number;
  name: string;
  color?: string;
  userId: number;
  useCount: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 账单标签查询参数
 */
export interface BillTagQueryParams extends PaginationParams {
  keyword?: string;
}

/**
 * 账单标签表单数据
 */
export interface BillTagFormData {
  id?: number;
  name: string;
  color?: string;
}

/**
 * 账单
 */
export interface Bill {
  id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId?: number;
  accountId: number;
  targetAccountId?: number;
  billDate: string;
  description?: string;
  imageUrls?: string;
  location?: string;
  tags?: BillTag[];
  tagIds?: number[];
  userId: number;
  createdAt: string;
  updatedAt?: string;
  account?: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    type?: {
      name: string;
    };
  };
  targetAccount?: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    type?: {
      name: string;
    };
  };
  category?: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    type: string;
    parent?: {
      id: number;
      name: string;
    };
  };
}

/**
 * 账单查询参数
 */
export interface BillQueryParams extends PaginationParams {
  keyword?: string;
  type?: string;
  accountId?: number;
  categoryId?: number;
  tagId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * 账单表单数据
 */
export interface BillFormData {
  id?: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId?: number;
  accountId: number;
  targetAccountId?: number;
  billDate: string;
  description?: string;
  imageUrls?: string;
  location?: string;
  tagIds?: number[];
}

/**
 * 账单批量删除参数
 */
export interface BatchDeleteParams {
  ids: number[];
}

/**
 * 预算
 */
export interface Budget {
  id: number;
  name: string;
  type: 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  amount: number;
  categoryIds?: string;
  userId: number;
  status: Status;
  createdAt: string;
  updatedAt?: string;
  categories?: BillCategory[];
  progress?: number;
  spent?: number;
  remaining?: number;
}

/**
 * 预算查询参数
 */
export interface BudgetQueryParams extends PaginationParams {
  keyword?: string;
  type?: string;
  status?: Status;
  startDate?: string;
  endDate?: string;
}

/**
 * 预算表单数据
 */
export interface BudgetFormData {
  id?: number;
  name: string;
  type: 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  amount: number;
  categoryIds?: number[];
  status: Status;
}

/**
 * 账单导入
 */
export interface BillImport {
  id: number;
  fileName: string;
  fileType: 'alipay' | 'wechat' | 'bank' | 'custom';
  totalCount: number;
  successCount: number;
  failCount: number;
  importDate: string;
  status: 'processing' | 'success' | 'failed';
  errorLog?: string;
  userId: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 账单导入查询参数
 */
export interface BillImportQueryParams extends PaginationParams {
  fileType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 账单导入表单数据
 */
export interface BillImportFormData {
  fileType: 'alipay' | 'wechat' | 'bank' | 'custom';
  file: File;
  mappingConfig?: Record<string, string>;
}

/**
 * 账单统计数据
 */
export interface BillStatistics {
  overview: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
    transferCount: number;
  };
  categoryStats: {
    type: 'income' | 'expense';
    categoryId: number;
    categoryName: string;
    color?: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  timeStats: {
    date: string;
    income: number;
    expense: number;
    balance: number;
  }[];
  accountStats: {
    accountId: number;
    accountName: string;
    color?: string;
    balance: number;
    income: number;
    expense: number;
    percentage: number;
  }[];
  tagStats?: {
    tagId: number;
    tagName: string;
    color?: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
}

/**
 * 分页响应
 */
export interface PaginationResult<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type AccountTypeListResult = PaginationResult<AccountType>;
export type AccountListResult = PaginationResult<Account>;
export type BillCategoryListResult = PaginationResult<BillCategory>;
export type BillTagListResult = PaginationResult<BillTag>;
export type BillListResult = PaginationResult<Bill>;
export type BudgetListResult = PaginationResult<Budget>;
export type BillImportListResult = PaginationResult<BillImport>;