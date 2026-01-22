import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../lib/ormClient/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(configVars: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configVars.getOrThrow('DATABASE_URL'),
    });

    super({ adapter });
  }
}
