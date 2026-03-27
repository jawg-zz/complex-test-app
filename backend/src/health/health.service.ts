import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private dataSource: DataSource,
  ) {}

  async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async checkRedis(): Promise<boolean> {
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      });
      await redis.ping();
      await redis.quit();
      return true;
    } catch {
      return false;
    }
  }
}
