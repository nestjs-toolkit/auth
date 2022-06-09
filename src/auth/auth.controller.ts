import { Controller, Get } from '@nestjs/common';
import { AuthService } from '@nestjs-toolkit/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  register() {
    return this.authService.register(
      {
        username: 'test@test.com',
      },
      'secret',
    );
  }

  @Get('login')
  login() {
    return this.authService.login('test@test.com', 'secret');
  }
}
