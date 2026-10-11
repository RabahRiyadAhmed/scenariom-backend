import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;

  constructor(config: ConfigService) {
    const password = encodeURIComponent(
      config.getOrThrow<string>('REDIS_PASS'),
    );
    const host = config.get<string>('REDIS_HOST', '127.0.0.1');
    const port = config.getOrThrow<string>('REDIS_PORT');
    this.client = createClient({
      url: `redis://default:${password}@${host}:${port}`,
    });
    this.client.on('error', () =>
      this.logger.error('Connexion Redis indisponible.'),
    );
  }
  async onModuleInit() {
    await this.client.connect();
  }
  async onModuleDestroy() {
    if (this.client.isOpen) await this.client.close();
  }
  async createSession(sessionId: string, userId: string, ttlSeconds: number) {
    await this.client.set(this.key(sessionId), userId, {
      expiration: { type: 'EX', value: ttlSeconds },
    });
  }
  async isSessionActive(sessionId: string, userId: string) {
    return (await this.client.get(this.key(sessionId))) === userId;
  }
  async revokeSession(sessionId: string) {
    await this.client.del(this.key(sessionId));
  }
  private key(sessionId: string) {
    return `scenariom:auth:session:${sessionId}`;
  }
}
