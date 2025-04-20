/**
 * 导出模块类型定义
 */

/**
 * 导出格式类型
 */
export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv'
}

/**
 * 字段配置接口
 */
export interface FieldConfig {
  /** 字段名称 (数据对象中的属性名) */
  field: string;
  /** 表头名称 */
  header: string;
  /** 字段宽度 (仅Excel有效) */
  width?: number;
  /** 格式化函数 */
  formatter?: (value: any, row: any) => any;
}

/**
 * 导出选项接口
 */
export interface ExportOptions {
  /** 表头字段配置 */
  fields: FieldConfig[];
  /** 文件名 (不含扩展名) */
  filename: string;
  /** 工作表名称 (仅Excel有效) */
  sheetName?: string;
  /** 导出格式，默认为Excel */
  format?: ExportFormat;
  /** 大数据量导出时的分块大小，默认1000 */
  chunkSize?: number;
  /** 是否包含表头，默认true */
  includeHeader?: boolean;
  /** 自定义样式配置 (仅Excel有效) */
  styles?: {
    header?: any;
    rows?: any;
  };
}

/**
 * 导出器接口
 */
export interface IExporter {
  /**
   * 导出数据
   * @param data 要导出的数据数组
   * @param options 导出选项
   * @returns 导出的文件Buffer
   */
  export<T = any>(data: T[], options: ExportOptions): Promise<Buffer>;
}