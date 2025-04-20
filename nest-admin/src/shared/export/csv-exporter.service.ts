/**
 * CSV导出实现
 */
import { Injectable } from '@nestjs/common';
import { createObjectCsvStringifier } from 'csv-writer';
import { IExporter, ExportOptions } from './export.types';

@Injectable()
export class CsvExporter implements IExporter {
  /**
   * 导出数据到CSV
   * @param data 要导出的数据数组
   * @param options 导出选项
   * @returns CSV文件的Buffer
   */
  async export<T = any>(data: T[], options: ExportOptions): Promise<Buffer> {
    // 创建CSV表头
    const header = options.fields.map(field => ({
      id: field.field,
      title: field.header
    }));

    // 创建CSV字符串生成器
    const csvStringifier = createObjectCsvStringifier({
      header,
      // 如果不包含表头，则设置为空数组
      alwaysQuote: options.includeHeader === false ? true : false,
    });

    // 写入表头（如果需要）
    let csvContent = options.includeHeader !== false 
      ? csvStringifier.getHeaderString() 
      : '';

    // 根据配置的chunkSize分块处理数据
    const chunkSize = options.chunkSize || 1000;

    // 分块处理数据
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      // 处理数据格式化
      const formattedChunk = chunk.map(item => {
        const formattedRow = {};
        
        options.fields.forEach(field => {
          let value = item[field.field];
          
          // 如果有格式化函数，应用它
          if (field.formatter) {
            value = field.formatter(value, item);
          }
          
          // 确保值为字符串，避免CSV格式问题
          formattedRow[field.field] = value !== null && value !== undefined ? String(value) : '';
        });
        
        return formattedRow;
      });
      
      // 添加到CSV内容
      csvContent += csvStringifier.stringifyRecords(formattedChunk);
    }

    // 返回CSV Buffer
    return Buffer.from(csvContent);
  }
}