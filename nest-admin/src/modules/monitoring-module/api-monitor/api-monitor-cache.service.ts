import { Injectable } from '@nestjs/common';
import { RedisService } from '@/shared/redis/redis.service';
import { format, subDays, subHours, subMinutes } from 'date-fns';

@Injectable()
export class ApiMonitorCacheService {
  // Redis 键前缀，避免命名冲突
  private readonly PREFIX = 'api_monitor:';
  
  // Redis 缓存 TTL 配置（秒）
  private readonly STATS_CACHE_TTL = 300; // 5分钟
  private readonly PERFORMANCE_CACHE_TTL = 600; // 10分钟
  private readonly REALTIME_CACHE_TTL = 60; // 1分钟
  private readonly API_CALL_RECORD_TTL = 86400; // 1天

  constructor(private readonly redisService: RedisService) {}

  // 键名生成器
  private getKey(name: string): string {
    return `${this.PREFIX}${name}`;
  }

  // ===== API 统计数据缓存 =====
  async cacheApiStatistics(days: number, data: any): Promise<void> {
    const key = this.getKey(`stats:${days}`);
    await this.redisService.set(key, data, this.STATS_CACHE_TTL);
  }

  async getApiStatisticsCache(days: number): Promise<any> {
    const key = this.getKey(`stats:${days}`);
    return this.redisService.get(key);
  }

  // ===== API 性能数据缓存 =====
  async cacheApiPerformance(queryHash: string, data: any): Promise<void> {
    const key = this.getKey(`performance:${queryHash}`);
    await this.redisService.set(key, data, this.PERFORMANCE_CACHE_TTL);
  }

  async getApiPerformanceCache(queryHash: string): Promise<any> {
    const key = this.getKey(`performance:${queryHash}`);
    return this.redisService.get(key);
  }

  // ===== 实时数据缓存 =====
  async cacheRealtimeData(data: any): Promise<void> {
    const key = this.getKey('realtime');
    await this.redisService.set(key, data, this.REALTIME_CACHE_TTL);
  }

  async getRealtimeDataCache(): Promise<any> {
    const key = this.getKey('realtime');
    return this.redisService.get(key);
  }

  // ===== 实时 API 调用记录 =====
  async recordApiCall(data: any): Promise<void> {
    // 使用 Redis 列表存储最近的 API 调用，保持列表最大长度为 100
    const key = this.getKey('recent_calls');
    await this.redisService.lpush(key, data);
    await this.redisService.ltrim(key, 0, 99); // 只保留最近的 100 条记录
    await this.redisService.expire(key, this.API_CALL_RECORD_TTL);

    // 更新 API 调用计数器，以路径和方法为键
    const countKey = this.getKey(`count:${data.path}:${data.method}`);
    await this.redisService.incr(countKey);
    await this.redisService.expire(countKey, this.API_CALL_RECORD_TTL);

    // 如果是错误请求，更新错误计数器
    if (data.statusCode >= 400) {
      const errorKey = this.getKey(`error:${data.path}:${data.method}`);
      await this.redisService.incr(errorKey);
      await this.redisService.expire(errorKey, this.API_CALL_RECORD_TTL);
    }

    // 更新响应时间有序集合，用于快速获取最慢的 API
    const slowestKey = this.getKey('slowest_apis');
    const member = `${data.path}:${data.method}:${data.statusCode}:${new Date().toISOString()}`;
    await this.redisService.zadd(slowestKey, data.responseTime, member);
    // 只保留分数最高的 50 个元素
    const count = await this.redisService.zcard(slowestKey);
    if (count > 50) {
      await this.redisService.zremrangebyrank(slowestKey, 0, count - 51);
    }
    await this.redisService.expire(slowestKey, this.API_CALL_RECORD_TTL);

    // 更新状态码分布
    const statusKey = this.getKey(`status:${data.statusCode}`);
    await this.redisService.incr(statusKey);
    await this.redisService.expire(statusKey, this.API_CALL_RECORD_TTL);

    // 更新调用趋势时间序列数据 - 按 5 分钟间隔
    const now = new Date();
    const timeGroup = format(now, 'yyyy-MM-dd:HH:mm');
    const timeKey = this.getKey(`trend:${Math.floor(now.getMinutes() / 5) * 5}`);
    await this.redisService.incr(timeKey);
    await this.redisService.expire(timeKey, 3600); // 保存1小时
  }

  // 获取最近的 API 调用记录
  async getRecentApiCalls(limit: number = 50): Promise<any[]> {
    const key = this.getKey('recent_calls');
    return this.redisService.lrange(key, 0, limit - 1);
  }

  // 获取响应时间最长的 API
  async getSlowestApis(limit: number = 10): Promise<any[]> {
    const key = this.getKey('slowest_apis');
    const results = await this.redisService.zrevrange(key, 0, limit - 1, true);
    
    // 解析结果
    const formattedResults = [];
    for (let i = 0; i < results.length; i += 2) {
      const [path, method, statusCode, timestamp] = results[i].split(':');
      const responseTime = parseFloat(results[i + 1]);
      
      formattedResults.push({
        path,
        method,
        statusCode: parseInt(statusCode),
        responseTime,
        createdAt: new Date(timestamp)
      });
    }
    
    return formattedResults;
  }

  // 获取状态码分布
  async getStatusCodeDistribution(): Promise<any[]> {
    // 获取所有状态码计数器
    const statusKeys = await this.redisService.keys(this.getKey('status:*'));
    const distribution = [];
    
    for (const key of statusKeys) {
      const statusCode = parseInt(key.split(':').pop());
      const count = parseInt(await this.redisService.get(key));
      
      distribution.push({
        statusCode,
        count,
        category: this.getStatusCategory(statusCode)
      });
    }
    
    return distribution;
  }

  // 获取调用趋势
  async getCallTrend(): Promise<any[]> {
    const now = new Date();
    const trend = [];
    
    // 获取过去 60 分钟的数据，每 5 分钟一个点
    for (let i = 11; i >= 0; i--) {
      const time = subMinutes(now, i * 5);
      const minute = Math.floor(time.getMinutes() / 5) * 5;
      const timeKey = this.getKey(`trend:${minute}`);
      
      const count = parseInt(await this.redisService.get(timeKey) || '0');
      trend.push({
        time: format(time, 'HH:mm'),
        count
      });
    }
    
    return trend;
  }

  // 获取 API 路径调用统计
  async getApiPathCounts(): Promise<any[]> {
    const countKeys = await this.redisService.keys(this.getKey('count:*'));
    const pathCounts = [];
    
    for (const key of countKeys) {
      const parts = key.split(':');
      const path = parts[2];
      const method = parts[3];
      const count = parseInt(await this.redisService.get(key));
      
      // 获取错误计数
      const errorKey = this.getKey(`error:${path}:${method}`);
      const errorCount = parseInt(await this.redisService.get(errorKey) || '0');
      
      pathCounts.push({
        path,
        method,
        count,
        error: errorCount,
        errorRate: count > 0 ? (errorCount / count) * 100 : 0
      });
    }
    
    // 按调用次数排序
    return pathCounts.sort((a, b) => b.count - a.count);
  }

  // 按状态码获取类别
  private getStatusCategory(statusCode: number): string {
    if (statusCode < 200) return 'information';
    if (statusCode < 300) return 'success';
    if (statusCode < 400) return 'redirection';
    if (statusCode < 500) return 'clientError';
    return 'serverError';
  }

  // ===== 辅助方法 =====
  // 获取匹配模式的所有 Redis 键
  async getRedisKeys(pattern: string): Promise<string[]> {
    const fullPattern = this.getKey(pattern);
    return this.redisService.keys(fullPattern);
  }

  // 清除特定键的缓存
  async invalidateCache(name: string): Promise<void> {
    const key = this.getKey(name);
    await this.redisService.del(key);
  }

  // 清除所有 API 监控缓存
  async invalidateAllCache(): Promise<void> {
    const keys = await this.redisService.keys(`${this.PREFIX}*`);
    for (const key of keys) {
      await this.redisService.del(key);
    }
  }
}