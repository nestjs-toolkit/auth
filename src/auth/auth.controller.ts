import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Request,
} from '@nestjs/common';
import {
  AuthAclPerms,
  AuthAclRoles,
  Public,
  UserRequest,
} from '@nestjs-toolkit/auth/decorators';
import { AclService, AuthService } from '@nestjs-toolkit/auth';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs-toolkit/base/exceptions';
import { UserAuthenticated } from '@nestjs-toolkit/auth/user';
import { PermissionEnum, RoleEnum } from './enum';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly aclService: AclService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() body) {
    try {
      const user = await this.authService.register(
        body.username,
        body.password,
      );

      return { ...user, password: undefined };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e.message, 'REGISTER_FAILED');
    }
  }

  @Public()
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
  me(@UserRequest() user: UserAuthenticated) {
    return user;
  }

  @Public()
  @Get('/acl')
  async getAcl() {
    return this.aclService.getData();
  }

  @Get('/acl/only-role-user')
  @AuthAclRoles(RoleEnum.User, 'foo')
  async onlyRoleUser() {
    return {
      message: 'Authorized',
    };
  }

  @Get('/acl/only-perms-post-write')
  @AuthAclPerms(PermissionEnum.PostWrite)
  async onlyPermsPostRead(@Request() req) {
    return {
      message: 'Authorized',
      roles: req.acl.getRoles(),
    };
  }
}
