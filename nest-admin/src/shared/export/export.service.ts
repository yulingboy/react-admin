/**
 * 数据导出服务
 * 提供Excel和CSV格式的数据导出功能
 */
import { Injectable } from '@nestjs/common';
import { ExcelExporter } from './excel-exporter.service';
import { CsvExporter } from './csv-exporter.service';
import { ExportFormat, ExportOptions, IExporter } from './export.types';

@Injectable()
export class ExportService {
  // 导出器映射表
  private exporters: Map<ExportFormat, IExporter> = new Map();

  constructor(
    private readonly excelExporter: ExcelExporter,
    private readonly csvExporter: CsvExporter,
  ) {
    // 注册导出器
    this.exporters.set(ExportFormat.EXCEL, this.excelExporter);
    this.exporters.set(ExportFormat.CSV, this.csvExporter);
  }

  /**
   * 导出数据
   * @param data 要导出的数据
   * @param options 导出选项
   * @returns 导出文件的Buffer和文件类型信息
   */
  async exportData<T = any>(
    data: T[],
    options: ExportOptions,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    // 使用提供的格式或默认为Excel
    const format = options.format || ExportFormat.EXCEL;
    
    // 获取对应的导出器
    const exporter = this.exporters.get(format);
    if (!exporter) {
      throw new Error(`不支持的导出格式: ${format}`);
    }

    // 执行导出
    const buffer = await exporter.export(data, options);

    // 确定MIME类型和文件名
    let mimeType: string;
    let extension: string;

    switch (format) {
      case ExportFormat.CSV:
        mimeType = 'text/csv';
        extension = '.csv';
        break;
      case ExportFormat.EXCEL:
      default:
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = '.xlsx';
        break;
    }

    // 返回导出结果
    return {
      buffer,
      mimeType,
      filename: `${options.filename}${extension}`,
    };
  }

  /**
   * 创建HTTP响应所需的头信息
   * @param filename 文件名
   * @param mimeType MIME类型
   * @returns HTTP头信息对象
   */
  createResponseHeaders(filename: string, mimeType: string): Record<string, string> {
    return {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    };
  }
}