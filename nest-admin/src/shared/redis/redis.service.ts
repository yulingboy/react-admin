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
      password: this.configService.get('redis.password', ''),  // 添加密码配置
    });
    
    // 添加错误处理
    this.redis.on('error', (err) => {
      console.error('Redis连接错误:', err);
    });
  }

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

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
    if (ttl) {
      await this.redis.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async reset(): Promise<void> {
    await this.redis.flushall();
  }
}
