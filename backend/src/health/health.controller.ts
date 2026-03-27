import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => ({ backend: { status: 'up' } }),
      () => ({ database: { status: 'up' } }),
    ]);
  }

  @Get('db')
  async checkDb() {
    const dbHealthy = await this.healthService.checkDatabase();
    return {
      status: dbHealthy ? 'up' : 'down',
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }

  @Get('redis')
  async checkRedis() {
    const redisHealthy = await this.healthService.checkRedis();
    return {
      status: redisHealthy ? 'up' : 'down',
      redis: redisHealthy ? 'connected' : 'disconnected',
    };
  }
}
