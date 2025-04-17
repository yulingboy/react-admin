import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { LogStatsQueryDto } from '../../dto/system-monitor.dto';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LogStatsService {
  private readonly logger = new Logger(LogStatsService.name);
  
  constructor(private prisma: PrismaService) {}

  /**
   * 获取日志统计数据
   */
  async getLogStats(query: LogStatsQueryDto) {
    const { startDate, endDate, level } = query;
    
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

    if (level) {
      where.level = level;
    }

    const stats = await this.prisma.logStat.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    return stats;
  }

  /**
   * 分析最新日志文件
   */
  async analyzeRecentLogs() {
    try {
      // 获取日志目录
      const logsDir = path.join(process.cwd(), 'logs');
      
      // 获取最新的日志文件
      const files = await fs.readdir(logsDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      // 按日期排序
      logFiles.sort().reverse();
      
      if (logFiles.length === 0) {
        return { message: '未找到日志文件' };
      }
      
      // 分析最新的日志文件
      const latestLog = path.join(logsDir, logFiles[0]);
      const content = await fs.readFile(latestLog, 'utf8');
      
      // 分析日志级别
      const errorCount = (content.match(/ERROR/g) || []).length;
      const warnCount = (content.match(/WARN/g) || []).length;
      const infoCount = (content.match(/INFO/g) || []).length;
      
      // 构建结果
      const result = {
        filename: logFiles[0],
        date: logFiles[0].replace('.log', ''),
        totalLines: content.split('\n').length,
        errorCount,
        warnCount,
        infoCount,
      };
      
      // 更新日志统计表
      await this.updateLogStats(result);
      
      return result;
    } catch (error) {
      this.logger.error('分析日志文件失败:', error);
      return { error: '分析日志文件失败' };
    }
  }

  /**
   * 定时分析日志文件 - 每天凌晨运行一次
   */
  @Cron('0 0 0 * * *')
  async scheduledLogAnalysis() {
    try {
      const result = await this.analyzeRecentLogs();
      this.logger.log(`定时日志分析已完成: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error('定时日志分析失败:', error);
    }
  }

  /**
   * 获取日志级别分布
   */
  async getLogDistribution() {
    try {
      // 获取过去30天的数据
      const startDate = subDays(new Date(), 30);
      
      const result = await this.prisma.logStat.groupBy({
        by: ['level'],
        _sum: {
          count: true
        },
        where: {
          date: {
            gte: startDate
          }
        }
      });
      
      const distribution = result.map(item => ({
        level: item.level,
        count: item._sum.count || 0,
      }));
      
      return distribution;
    } catch (error) {
      this.logger.error('获取日志分布失败:', error);
      return [];
    }
  }

  /**
   * 获取详细的错误日志信息
   */
  async getErrorLogs(limit: number = 10) {
    try {
      // 获取日志目录
      const logsDir = path.join(process.cwd(), 'logs');
      const files = await fs.readdir(logsDir);
      const logFiles = files.filter(file => file.endsWith('.log')).sort().reverse();
      
      if (logFiles.length === 0) {
        return [];
      }
      
      // 分析最近的日志文件
      const latestLog = path.join(logsDir, logFiles[0]);
      const content = await fs.readFile(latestLog, 'utf8');
      
      // 提取错误日志行
      const lines = content.split('\n');
      const errorLines = lines.filter(line => line.includes('ERROR'));
      
      // 解析错误日志
      const errorLogs = errorLines.slice(0, limit).map(line => {
        // 简单解析，实际可能需要更复杂的逻辑
        const timestamp = line.match(/\[(.*?)\]/)?.[1] || '';
        const errorMessage = line.replace(/\[.*?\]/g, '').trim();
        
        return {
          timestamp,
          message: errorMessage,
          level: 'ERROR',
        };
      });
      
      return errorLogs;
    } catch (error) {
      this.logger.error('获取错误日志失败:', error);
      return [];
    }
  }

  /**
   * 更新日志统计数据
   */
  private async updateLogStats(data: {
    date: string;
    errorCount: number;
    warnCount: number;
    infoCount: number;
  }) {
    const date = startOfDay(new Date(data.date));
    
    // 更新或创建ERROR级别统计
    await this.upsertLogStat('ERROR', date, data.errorCount);
    
    // 更新或创建WARN级别统计
    await this.upsertLogStat('WARN', date, data.warnCount);
    
    // 更新或创建INFO级别统计
    await this.upsertLogStat('INFO', date, data.infoCount);
  }

  /**
   * 更新或创建日志统计记录
   */
  private async upsertLogStat(level: string, date: Date, count: number) {
    const existing = await this.prisma.logStat.findFirst({
      where: {
        level,
        date,
      },
    });
    
    if (existing) {
      await this.prisma.logStat.update({
        where: { id: existing.id },
        data: { count },
      });
    } else {
      await this.prisma.logStat.create({
        data: {
          level,
          date,
          count,
        },
      });
    }
  }

  /**
   * 获取最近几天的日志统计趋势
   */
  async getLogTrends(days: number = 7) {
    try {
      // 计算过去几天的开始日期
      const startDate = subDays(new Date(), days);
      startDate.setHours(0, 0, 0, 0);

      const stats = await this.prisma.logStat.findMany({
        where: {
          date: {
            gte: startDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // 按日期和级别组织数据
      const trendsByDate = {};
      
      // 创建所有日期的空记录以确保连续
      for (let i = 0; i <= days; i++) {
        const date = subDays(new Date(), days - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        trendsByDate[dateStr] = {
          date: dateStr,
          ERROR: 0,
          WARN: 0,
          INFO: 0,
        };
      }
      
      // 填充实际数据
      stats.forEach(stat => {
        const dateStr = format(stat.date, 'yyyy-MM-dd');
        
        if (trendsByDate[dateStr]) {
          trendsByDate[dateStr][stat.level] = stat.count;
        }
      });
      
      return Object.values(trendsByDate);
    } catch (error) {
      this.logger.error('获取日志趋势失败:', error);
      return [];
    }
  }
}