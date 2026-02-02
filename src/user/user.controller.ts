import { Body, Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  me(@Session() session: UserSession) {
    return session.user;
  }
}
