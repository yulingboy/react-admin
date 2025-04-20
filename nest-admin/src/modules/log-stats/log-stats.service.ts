import { Injectable, Logger } from '@nestjs/common';
import { startOfDay, endOfDay, subDays, format, parseISO } from 'date-fns';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { LogStatsQueryDto } from './dto/log-stats.dto';
import * as chokidar from 'chokidar';

@Injectable()
export class LogStatsService {
  private readonly logger = new Logger(LogStatsService.name);
  private logWatcher: any;
  
  // 缓存最新的日志分析结果，避免频繁IO操作
  private latestAnalysisCache: any = null;
  private latestAnalysisTime: number = 0;
  private logTrendsCache: any = null;
  private logDistributionCache: any = null;
  private errorLogsCache: any = null;
  
  constructor(private prisma: PrismaService) {
    // 初始化日志文件监控
    this.initLogWatcher();
    
    // 初始化缓存数据
    this.initCache();
  }

  /**
   * 初始化缓存数据
   */
  private async initCache() {
    try {
      // 预加载日志分析结果到缓存
      this.latestAnalysisCache = await this.analyzeRecentLogs();
      this.latestAnalysisTime = Date.now();
      
      // 预加载日志趋势数据
      this.logTrendsCache = await this.getLogTrendsFromDb(7);
      
      // 预加载日志分布数据
      this.logDistributionCache = await this.getLogDistributionFromDb();
      
      // 预加载错误日志数据
      this.errorLogsCache = await this.getErrorLogsFromFile(10);
      
      this.logger.log('日志统计缓存数据已初始化');
    } catch (error) {
      this.logger.error('初始化缓存数据失败:', error);
    }
  }

  /**
   * 初始化日志文件监控功能
   * 使用chokidar监控日志文件变化，实现准实时日志分析
   */
  private initLogWatcher() {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      
      // 使用chokidar监控日志文件夹的变化
      this.logWatcher = chokidar.watch(`${logsDir}/*.log`, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 500
        }
      });
      
      this.logWatcher
        .on('add', (path) => this.handleLogFileChange(path))
        .on('change', (path) => this.handleLogFileChange(path));
      
      this.logger.log('日志文件监控已启动');
    } catch (error) {
      this.logger.error('初始化日志监控失败:', error);
    }
  }

  /**
   * 处理日志文件变化事件
   */
  private async handleLogFileChange(filePath: string) {
    try {
      // 只处理今天的日志文件，减少不必要的IO操作
      const logFileName = path.basename(filePath);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (logFileName !== `${today}.log`) {
        return;
      }
      
      this.logger.debug(`日志文件 ${logFileName} 发生变化`);
      
      // 防止频繁分析，限制至少间隔30秒
      if (Date.now() - this.latestAnalysisTime < 30000) {
        return;
      }
      
      // 对于变更的日志文件，进行分析并更新缓存
      this.latestAnalysisCache = await this.analyzeLogFile(filePath);
      this.latestAnalysisTime = Date.now();
      
      // 更新其他缓存数据
      this.logTrendsCache = await this.getLogTrendsFromDb(7);
      this.logDistributionCache = await this.getLogDistributionFromDb();
      this.errorLogsCache = await this.getErrorLogsFromFile(10);
    } catch (error) {
      this.logger.error(`处理日志文件变化事件失败: ${error.message}`);
    }
  }

  /**
   * 分析指定的日志文件
   * @param filePath 日志文件路径
   */
  private async analyzeLogFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // 分析日志级别
      const errorCount = (content.match(/ERROR/g) || []).length;
      const warnCount = (content.match(/WARN/g) || []).length;
      const infoCount = (content.match(/INFO/g) || []).length;
      
      // 构建结果
      const result = {
        filename: path.basename(filePath),
        date: path.basename(filePath).replace('.log', ''),
        totalLines: content.split('\n').length,
        errorCount,
        warnCount,
        infoCount,
        timestamp: new Date().toISOString()
      };
      
      // 更新日志统计表
      await this.updateLogStats({
        date: result.date,
        errorCount,
        warnCount,
        infoCount
      });
      
      return result;
    } catch (error) {
      this.logger.error(`分析日志文件失败: ${filePath}`, error);
      throw error;
    }
  }

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
   * 如果距离上次分析时间小于1分钟，直接返回缓存结果
   */
  async analyzeRecentLogs() {
    try {
      // 如果缓存存在且时间小于1分钟，直接返回缓存
      if (this.latestAnalysisCache && (Date.now() - this.latestAnalysisTime < 60000)) {
        return this.latestAnalysisCache;
      }
      
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
      this.latestAnalysisCache = await this.analyzeLogFile(latestLog);
      this.latestAnalysisTime = Date.now();
      
      return this.latestAnalysisCache;
    } catch (error) {
      this.logger.error('分析日志文件失败:', error);
      return { error: '分析日志文件失败' };
    }
  }

  /**
   * 定时分析日志文件 - 每小时运行一次
   */
  @Cron('0 0 * * * *')
  async scheduledLogAnalysis() {
    try {
      this.latestAnalysisCache = await this.analyzeRecentLogs();
      this.logTrendsCache = await this.getLogTrendsFromDb(7);
      this.logDistributionCache = await this.getLogDistributionFromDb();
      this.errorLogsCache = await this.getErrorLogsFromFile(10);
      this.logger.log(`定时日志分析已完成: ${JSON.stringify(this.latestAnalysisCache)}`);
    } catch (error) {
      this.logger.error('定时日志分析失败:', error);
    }
  }

  /**
   * 获取日志级别分布
   * 如果缓存有效，直接返回缓存
   */
  async getLogDistribution() {
    try {
      // 如果有缓存，直接返回
      if (this.logDistributionCache) {
        return this.logDistributionCache;
      }
      
      // 从数据库获取并更新缓存
      this.logDistributionCache = await this.getLogDistributionFromDb();
      return this.logDistributionCache;
    } catch (error) {
      this.logger.error('获取日志分布失败:', error);
      return [];
    }
  }
  
  /**
   * 从数据库获取日志分布数据
   */
  private async getLogDistributionFromDb() {
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
    
    return result.map(item => ({
      level: item.level,
      count: item._sum.count || 0,
    }));
  }

  /**
   * 获取详细的错误日志信息
   * 如果缓存有效，直接返回缓存
   */
  async getErrorLogs(limit: number = 10) {
    try {
      // 如果有缓存，直接返回
      if (this.errorLogsCache) {
        return this.errorLogsCache;
      }
      
      // 从文件获取并更新缓存
      this.errorLogsCache = await this.getErrorLogsFromFile(limit);
      return this.errorLogsCache;
    } catch (error) {
      this.logger.error('获取错误日志失败:', error);
      return [];
    }
  }
  
  /**
   * 从文件获取错误日志数据
   */
  private async getErrorLogsFromFile(limit: number = 10) {
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
    return errorLines.slice(0, limit).map(line => {
      // 正则表达式匹配时间戳
      const timestamp = line.match(/\[(.*?)\]/)?.[1] || '';
      // 提取上下文 - 第二个方括号中的内容通常是上下文
      const context = line.match(/\[.*?\]\s+\[(.*?)\]/)?.[1] || '';
      // 提取消息内容 - 移除所有方括号内容后的剩余部分
      const errorMessage = line.replace(/\[.*?\]/g, '').trim();
      
      return {
        timestamp,
        context,
        message: errorMessage,
        level: 'ERROR',
      };
    });
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
   * 如果缓存有效，直接返回缓存
   */
  async getLogTrends(days: number = 7) {
    try {
      // 如果有缓存且请求的是默认7天，直接返回
      if (this.logTrendsCache && days === 7) {
        return this.logTrendsCache;
      }
      
      // 从数据库获取并更新缓存
      const trends = await this.getLogTrendsFromDb(days);
      
      // 如果是默认7天，更新缓存
      if (days === 7) {
        this.logTrendsCache = trends;
      }
      
      return trends;
    } catch (error) {
      this.logger.error('获取日志趋势失败:', error);
      return [];
    }
  }

  /**
   * 从数据库获取日志趋势数据
   */
  private async getLogTrendsFromDb(days: number = 7) {
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
  }
  
  /**
   * 获取实时日志统计概览数据
   * 整合最新的分析结果、趋势和分布数据
   */
  async getLogStatsOverview() {
    try {
      const [analysis, trends, distribution] = await Promise.all([
        this.analyzeRecentLogs(),
        this.getLogTrends(),
        this.getLogDistribution()
      ]);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayStats = trends.find(t => t.date === today) || { 
        ERROR: 0, 
        WARN: 0, 
        INFO: 0 
      };
      
      // 计算今日错误率
      const totalLogs = todayStats.ERROR + todayStats.WARN + todayStats.INFO;
      const errorRate = totalLogs > 0 ? (todayStats.ERROR / totalLogs) * 100 : 0;
      
      return {
        analysis,
        todayStats: {
          date: today,
          totalLogs,
          errorCount: todayStats.ERROR,
          warnCount: todayStats.WARN,
          infoCount: todayStats.INFO,
          errorRate: parseFloat(errorRate.toFixed(2))
        },
        trends: trends.slice(-7), // 只返回最近7天的趋势
        distribution,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('获取日志统计概览失败:', error);
      return {
        error: '获取日志统计概览失败',
        updatedAt: new Date().toISOString()
      };
    }
  }
}