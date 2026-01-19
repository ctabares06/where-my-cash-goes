import { Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { createUserDto } from './user.dto';
import { APIError } from 'better-auth';

@Injectable()
export class UserService {
  constructor(private authService: AuthService) {}
}
