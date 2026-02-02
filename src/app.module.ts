import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { CategoriesModule } from './categories/categories.module';

import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRoot({ auth, isGlobal: true }),
    UserModule,
    CategoriesModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
