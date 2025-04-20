/**
 * 导出模块定义
 * 提供Excel和CSV数据导出功能
 */
import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExcelExporter } from './excel-exporter.service';
import { CsvExporter } from './csv-exporter.service';

/**
 * 导出模块
 * 整合了Excel和CSV格式的数据导出功能
 */
@Module({
  providers: [
    ExportService,
    ExcelExporter,
    CsvExporter,
  ],
  exports: [
    ExportService
  ],
})
export class ExportModule {}