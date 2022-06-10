import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Request,
} from '@nestjs/common';
import { AuthPublic } from '@nestjs-toolkit/auth/decorators';
import { AuthService } from '@nestjs-toolkit/auth';
import { UnauthorizedException } from '@nestjs-toolkit/base/exceptions';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @AuthPublic()
  @Post('register')
  async register(@Body() body) {
    const user = await this.authService.register(
      {
        username: body.username,
      },
      body.password,
    );

    return { ...user, password: undefined };
  }

  @AuthPublic()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body) {
    try {
      const user = await this.authService.login(body.username, body.password);
      return this.authService.signJwt(user);
    } catch (e) {
      this.logger.error(e);
      throw new UnauthorizedException(
        'Login or password is incorrect',
        'LOGIN_FAILED',
      );
    }
  }

  @Get('me')
  me(@Request() req) {
    return req.user;
  }
}
