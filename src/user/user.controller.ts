import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './user.dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
}
