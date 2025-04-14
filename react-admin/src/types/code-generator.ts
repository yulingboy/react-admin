/**
 * 代码生成器类型定义
 */
export interface CodeGenerator {
  id: number;
  name: string;
  description?: string;
  tableName: string;
  moduleName: string;
  businessName: string;
  options?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 代码生成器列
 */
export interface CodeGeneratorColumn {
  id: number;
  generatorId: number;
  columnName: string;
  columnComment?: string;
  columnType: string;
  tsType: string;
  isPk: boolean;
  isIncrement: boolean;
  isRequired: boolean;
  isInsert: boolean;
  isEdit: boolean;
  isList: boolean;
  isQuery: boolean;
  queryType?: string;
  htmlType?: string;
  dictType?: string;
  sort: number;
}

/**
 * 代码生成器查询参数
 */
export interface CodeGeneratorQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  tableName?: string;
}

/**
 * 数据库表信息
 */
export interface TableInfo {
  tableName: string;
  tableComment: string;
}

/**
 * 表列信息
 */
export interface ColumnInfo {
  columnName: string;
  columnComment: string;
  columnType: string;
  columnKey: string;
  isNullable: string;
  columnDefault: string;
  extra: string;
}

/**
 * 查询类型枚举
 */
export enum QueryType {
  EQ = 'EQ', // 等于
  NE = 'NE', // 不等于
  GT = 'GT', // 大于
  GTE = 'GTE', // 大于等于
  LT = 'LT', // 小于
  LTE = 'LTE', // 小于等于
  LIKE = 'LIKE', // 模糊匹配
  BETWEEN = 'BETWEEN', // 范围
}

/**
 * HTML类型枚举
 */
export enum HtmlType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATETIME = 'datetime',
  UPLOAD = 'upload',
  IMAGE = 'image',
}

/**
 * 代码生成选项
 */
export interface CodeGenerateOptions {
  generateApi?: boolean;
  generateCrud?: boolean;
  generateRoutes?: boolean;
  generateTest?: boolean;
}

/**
 * 代码预览
 */
export interface CodePreview {
  path: string;
  content: string;
}