import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule, AuthService } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [AuthModule],
  providers: [UserService, AuthService],
  controllers: [UserController],
})
export class UserModule {}
