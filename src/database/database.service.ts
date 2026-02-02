import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../lib/ormClient/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient;
  constructor(configVars: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configVars.getOrThrow('DATABASE_URL'),
    });

    this.client = new PrismaClient({ adapter });
  }

  category() {
    return this.client.category;
  }

  transaction() {
    return this.client.transaction;
  }

  cycle() {
    return this.client.cycle;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
