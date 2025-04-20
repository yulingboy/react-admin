/**
 * Excel导出实现
 */
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IExporter, ExportOptions, FieldConfig } from './export.types';

@Injectable()
export class ExcelExporter implements IExporter {
  /**
   * 导出数据到Excel
   * @param data 要导出的数据数组
   * @param options 导出选项
   * @returns Excel文件的Buffer
   */
  async export<T = any>(data: T[], options: ExportOptions): Promise<Buffer> {
    // 创建工作簿和工作表
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');

    // 定义默认列宽
    const defaultWidth = 15;

    // 设置列定义
    const columns = options.fields.map((field: FieldConfig) => ({
      header: field.header,
      key: field.field,
      width: field.width || defaultWidth
    }));
    worksheet.columns = columns;

    // 添加表头样式
    if (options.includeHeader !== false) {
      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        bold: true,
        size: 12,
        color: { argb: '000000' }
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'f2f2f2' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // 应用自定义表头样式
      if (options.styles?.header) {
        Object.assign(headerRow, options.styles.header);
      }
      
      // 冻结表头
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    }

    // 根据配置的chunkSize分块处理数据
    const chunkSize = options.chunkSize || 1000;
    
    // 用于跟踪已处理的行数
    let rowCount = options.includeHeader !== false ? 1 : 0;

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
          
          formattedRow[field.field] = value;
        });
        
        return formattedRow;
      });
      
      // 添加数据到工作表
      worksheet.addRows(formattedChunk);
    }

    // 应用行样式
    if (options.styles?.rows) {
      for (let i = options.includeHeader !== false ? 2 : 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        Object.assign(row, options.styles.rows);
        // 交替行颜色
        if (i % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffffff' }
          };
        } else {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f9f9f9' }
          };
        }
      }
    }

    // 生成Excel Buffer
    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }
}