import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { LogStatsQueryDto } from '../dto/system-monitor.dto';
import { startOfDay, endOfDay } from 'date-fns';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LogStatsService {
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
        return { message: 'No log files found' };
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
      console.error('Error analyzing logs:', error);
      return { error: 'Failed to analyze logs' };
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
    // 计算过去几天的开始日期
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
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
    
    stats.forEach(stat => {
      const dateStr = stat.date.toISOString().split('T')[0];
      
      if (!trendsByDate[dateStr]) {
        trendsByDate[dateStr] = {
          date: dateStr,
          ERROR: 0,
          WARN: 0,
          INFO: 0,
        };
      }
      
      trendsByDate[dateStr][stat.level] = stat.count;
    });
    
    return Object.values(trendsByDate);
  }
}