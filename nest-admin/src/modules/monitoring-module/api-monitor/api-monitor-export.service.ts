import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { ApiExportQueryDto } from './dto/api-monitor.dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ApiMonitorExportService {
  private readonly logger = new Logger(ApiMonitorExportService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 导出API监控数据
   */
  async exportApiMonitorData(query: ApiExportQueryDto) {
    const { startDate, endDate, format = 'csv', includeDetails = false } = query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: startOfDay(new Date(startDate)),
        lte: endOfDay(new Date(endDate)),
      };
    } else if (startDate) {
      where.date = {
        gte: startOfDay(new Date(startDate)),
      };
    } else if (endDate) {
      where.date = {
        lte: endOfDay(new Date(endDate)),
      };
    }
    
    // 获取主要监控数据
    const monitorData = await this.prisma.apiMonitor.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
    
    // 如果请求了详细信息，还需获取详细记录
    let detailData = [];
    if (includeDetails) {
      const detailWhere: any = {};
      
      if (startDate && endDate) {
        detailWhere.createdAt = {
          gte: startOfDay(new Date(startDate)),
          lte: endOfDay(new Date(endDate)),
        };
      } else if (startDate) {
        detailWhere.createdAt = {
          gte: startOfDay(new Date(startDate)),
        };
      } else if (endDate) {
        detailWhere.createdAt = {
          lte: endOfDay(new Date(endDate)),
        };
      }
      
      detailData = await this.prisma.apiMonitorDetail.findMany({
        where: detailWhere,
        orderBy: {
          createdAt: 'desc',
        },
        take: 10000, // 限制导出的详细记录数量
      });
    }
    
    // 根据格式返回不同的数据
    // 注意：实际导出逻辑可能需要在控制器中处理，这里只返回数据
    return {
      format,
      monitorData,
      detailData: includeDetails ? detailData : [],
    };
  }
}