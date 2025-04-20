import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { subDays, startOfDay } from 'date-fns';

@Injectable()
export class ApiMonitorDataService {
  private readonly logger = new Logger(ApiMonitorDataService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 生成测试API监控数据
   * 用于初始化或测试阶段
   */
  async generateTestData() {
    try {
      const today = startOfDay(new Date());
      const apiPaths = [
        '/api/users',
        '/api/roles',
        '/api/auth/login',
        '/api/dictionaries',
        '/api/configs',
        '/api/code-generator/templates',
        '/api/sql-executor/execute',
        '/api/api-tester/collections',
        '/api/db-manager/connections',
      ];
      
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const statusCodes = [200, 201, 400, 401, 403, 404, 500];
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      ];
      const ips = ['192.168.1.1', '192.168.1.2', '10.0.0.1', '172.16.0.1', '127.0.0.1'];
      
      // 清除现有测试数据
      await this.prisma.apiMonitor.deleteMany({});
      await this.prisma.apiMonitorDetail.deleteMany({});
      
      // 生成过去7天的测试数据
      const createdRecords = [];
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        
        // 为每个API路径生成记录
        for (const path of apiPaths) {
          // 为每个API生成不同的HTTP方法记录
          for (const method of methods) {
            // 只为部分组合生成记录，使数据更真实
            if (Math.random() > 0.3) {
              const responseTime = Math.floor(Math.random() * 500) + 10; // 10ms到510ms之间
              const requestCount = Math.floor(Math.random() * 100) + 1; // 1到100之间的请求数
              const contentLength = Math.floor(Math.random() * 2000) + 100; // 100到2100字节
              const responseSize = Math.floor(Math.random() * 5000) + 200; // 200到5200字节
              
              // 大部分是成功的请求，少部分是错误请求
              const statusCode = Math.random() > 0.9 
                ? statusCodes[Math.floor(Math.random() * statusCodes.length)]
                : 200;
              
              // 计算错误请求数量
              const errorCount = statusCode >= 400 
                ? Math.floor(Math.random() * requestCount * 0.2)  // 最多20%的请求出错
                : 0;
              
              // 选择随机的UA和IP
              const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
              const ip = ips[Math.floor(Math.random() * ips.length)];
              
              // 创建API监控记录
              const record = await this.prisma.apiMonitor.create({
                data: {
                  path,
                  method,
                  statusCode,
                  responseTime,
                  contentLength,
                  responseSize,
                  userAgent,
                  ip,
                  requestCount,
                  errorCount,
                  date,
                },
              });
              
              createdRecords.push(record);
            }
          }
        }
      }
      
      // 生成详细记录 - 最近1小时的记录
      const detailRecords = [];
      for (let i = 0; i < 100; i++) {
        const minutesAgo = Math.floor(Math.random() * 60); // 0到59分钟前
        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);
        
        const path = apiPaths[Math.floor(Math.random() * apiPaths.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        const statusCode = Math.random() > 0.9 
          ? statusCodes[Math.floor(Math.random() * statusCodes.length)]
          : 200;
        const responseTime = Math.floor(Math.random() * 500) + 10;
        const contentLength = Math.floor(Math.random() * 2000) + 100;
        const responseSize = Math.floor(Math.random() * 5000) + 200;
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const ip = ips[Math.floor(Math.random() * ips.length)];
        const errorMessage = statusCode >= 400 ? 'Error processing request' : null;
        
        const record = await this.prisma.apiMonitorDetail.create({
          data: {
            path,
            method,
            statusCode,
            responseTime,
            contentLength,
            responseSize,
            userAgent,
            ip,
            errorMessage,
            createdAt: timestamp,
          },
        });
        
        detailRecords.push(record);
      }
      
      // 创建一些警报配置
      const alertConfigs = [
        {
          path: null, // 全局配置
          responseTimeThreshold: 1000,
          errorRateThreshold: 5,
          enabled: true,
        },
        {
          path: '/api/users', // 特定路径配置
          responseTimeThreshold: 500,
          errorRateThreshold: 2,
          enabled: true,
        }
      ];
      
      for (const config of alertConfigs) {
        await this.prisma.apiAlertConfig.create({
          data: config
        });
      }
      
      // 生成测试数据后清除所有缓存
      await this.cacheService.invalidateAllCache();

      return {
        success: true,
        message: '测试数据生成成功',
        count: {
          monitor: createdRecords.length,
          details: detailRecords.length,
          alerts: alertConfigs.length
        },
      };
    } catch (error) {
      this.logger.error('生成测试数据失败:', error);
      return { 
        success: false,
        message: '生成测试数据失败',
        error: error.message 
      };
    }
  }
  
  /**
   * 清理旧监控数据
   * 可以定期执行以防止数据库过大
   */
  async cleanupOldData(daysToKeep: number = 30) {
    try {
      const cutoffDate = subDays(new Date(), daysToKeep);
      
      // 删除旧的汇总数据
      const deletedMonitor = await this.prisma.apiMonitor.deleteMany({
        where: {
          date: {
            lt: cutoffDate,
          },
        },
      });
      
      // 删除旧的详细记录
      const deletedDetails = await this.prisma.apiMonitorDetail.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      
      // 清理数据后清除所有缓存
      await this.cacheService.invalidateAllCache();

      return {
        success: true,
        message: `成功清理${daysToKeep}天前的数据`,
        deletedCount: {
          monitor: deletedMonitor.count,
          details: deletedDetails.count,
        },
      };
    } catch (error) {
      this.logger.error('清理旧数据失败:', error);
      return {
        success: false,
        message: '清理失败',
        error: error.message,
      };
    }
  }
}