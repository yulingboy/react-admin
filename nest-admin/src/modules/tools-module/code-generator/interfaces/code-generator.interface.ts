export interface TableInfo {
  tableName: string;
  tableComment: string;
}

export interface ColumnInfo {
  columnName: string;
  columnComment: string;
  columnType: string;
  columnKey: string;
  isNullable: string;
  columnDefault: string;
  extra: string;
}

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

export interface CodeGenerateOptions {
  generateApi?: boolean;
  generateCrud?: boolean;
  generateRoutes?: boolean;
  generateTest?: boolean;
}

export interface GenerateCode {
  path: string;
  content: string;
}
