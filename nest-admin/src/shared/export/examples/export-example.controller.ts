/**
 * 导出服务使用示例
 * 此文件展示如何在控制器中集成导出功能
 */
import { Controller, Get, Query, Res, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from '../export.service';
import { ExportFormat } from '../export.types';

/**
 * 示例数据接口
 */
interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

/**
 * 导出功能示例控制器
 * 此示例演示了如何在实际应用中使用导出服务
 */
@Controller('example')
export class ExportExampleController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * 导出用户数据示例接口
   * @param format 导出格式，支持excel和csv
   * @param res HTTP响应对象
   * @returns 导出的文件流
   */
  @Get('export-users')
  async exportUsers(
    @Query('format') format: 'excel' | 'csv' = 'excel',
    @Res() res: Response,
  ) {
    // 模拟从数据库获取用户数据
    const users = this.getMockUserData();

    // 定义导出的字段配置
    const exportOptions = {
      fields: [
        { field: 'id', header: 'ID' },
        { field: 'username', header: '用户名' },
        { field: 'email', header: '邮箱' },
        { field: 'role', header: '角色' },
        { 
          field: 'status', 
          header: '状态', 
          formatter: (value: string) => value === '1' ? '启用' : '禁用'
        },
        { 
          field: 'createdAt', 
          header: '创建时间',
          formatter: (value: Date) => value.toLocaleString()
        },
      ],
      filename: '用户数据导出',
      format: format === 'csv' ? ExportFormat.CSV : ExportFormat.EXCEL,
      sheetName: '用户列表',
    };

    // 执行导出
    const result = await this.exportService.exportData(users, exportOptions);

    // 设置响应头
    const headers = this.exportService.createResponseHeaders(
      result.filename,
      result.mimeType,
    );
    
    // 设置响应头
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // 发送文件
    return res.send(result.buffer);
  }

  /**
   * 生成模拟用户数据
   * @returns 用户数据数组
   */
  private getMockUserData(): UserData[] {
    // 这里只是示例数据，实际应用中应该从数据库中获取
    return [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: '管理员',
        status: '1',
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 2,
        username: 'test',
        email: 'test@example.com',
        role: '普通用户',
        status: '1',
        createdAt: new Date('2025-02-15'),
      },
      {
        id: 3,
        username: 'disabled',
        email: 'disabled@example.com',
        role: '普通用户',
        status: '0',
        createdAt: new Date('2025-03-20'),
      },
    ];
  }
}