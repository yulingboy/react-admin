import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('redis.host', 'localhost'),
      port: this.configService.get('redis.port', 6379),
      password: this.configService.get('redis.password', ''), // 添加密码配置
    });

    // 添加错误处理
    this.redis.on('error', (err) => {
      console.error('Redis连接错误:', err);
    });
  }

  /**
   * 根据键名获取值
   * @param key 键名
   * @returns  值
   */
  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  }

  /**
   * 设置键值对
   * @param key 键名
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

    if (ttl) {
      await this.redis.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  /**
   * 删除键值对
   * @param key 键名
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 清空所有键值对
   */
  async reset(): Promise<void> {
    await this.redis.flushall();
  }

  /**
   * 自增计数器
   * @param key 键名
   * @returns 
   */
  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  /**
   * 自减计数器
   * @param key 键名
   * @returns 
   */
  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  /**
   * 设置键的过期时间
   * @param key 键名
   * @param seconds 过期时间（秒）
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  /**
   * 检查键是否存在
   * @param key 键名
   * @returns 存在返回true，否则返回false
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * 获取所有键名
   * @param pattern 匹配模式
   * @returns 键名数组
   */
  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  
  /**
   * 哈希表操作，适用于存储对象或结构化数据
   * @param key 键名
   * @param field 字段名
   * @param value 值
   * @returns void
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    await this.redis.hset(key, field, stringValue);
  }

  /**
   * 获取哈希表中的字段值
   * @param key 键名
   * @param field 字段名
   * @returns 值
   */
  async hget(key: string, field: string): Promise<any> {
    const value = await this.redis.hget(key, field);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  }

  /**
   * 获取哈希表中的所有字段值
   * @param key 键名
   * @returns 字段值对象
   */
  async hgetall(key: string): Promise<Record<string, any>> {
    const result = await this.redis.hgetall(key);
    const parsedResult: Record<string, any> = {};
    
    for (const field in result) {
      try {
        parsedResult[field] = JSON.parse(result[field]);
      } catch (e) {
        parsedResult[field] = result[field];
      }
    }
    
    return parsedResult;
  }

  
  async hincrby(key: string, field: string, increment: number): Promise<number> {
    return this.redis.hincrby(key, field, increment);
  }

  // 新增：有序集合操作，适用于排名和排序场景
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redis.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    if (withScores) {
      return this.redis.zrange(key, start, stop, 'WITHSCORES');
    }
    return this.redis.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    if (withScores) {
      return this.redis.zrevrange(key, start, stop, 'WITHSCORES');
    }
    return this.redis.zrevrange(key, start, stop);
  }

  // 新增：获取有序集合的元素数量
  async zcard(key: string): Promise<number> {
    return this.redis.zcard(key);
  }

  // 新增：根据排名范围删除有序集合中的元素
  async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    return this.redis.zremrangebyrank(key, start, stop);
  }

  // 新增：列表操作，适用于最近记录的场景
  async lpush(key: string, value: any): Promise<number> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    return this.redis.lpush(key, stringValue);
  }

  async rpush(key: string, value: any): Promise<number> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    return this.redis.rpush(key, stringValue);
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const results = await this.redis.lrange(key, start, stop);
    return results.map(item => {
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    });
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    await this.redis.ltrim(key, start, stop);
  }

  // 新增：事务操作
  getRedisClient(): Redis {
    return this.redis;
  }
}
