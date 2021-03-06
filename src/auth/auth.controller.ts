import { Body, Controller, Get, HttpCode, Logger, Post } from '@nestjs/common';
import {
  AclRequest,
  AuthAclPerms,
  AuthAclRoles,
  Public,
  UserRequest,
  XAccountRequest,
} from '@nestjs-toolkit/auth/decorators';
import { AclContext, AclService, AuthService } from '@nestjs-toolkit/auth';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs-toolkit/base/exceptions';
import { UserAuthenticated } from '@nestjs-toolkit/auth/user';
import { AuthException } from '@nestjs-toolkit/auth/exceptions';
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

      if (e instanceof AuthException) {
        throw new UnauthorizedException(e.message, e.errorCode);
      }

      throw new UnauthorizedException('Failed to login', 'LOGIN_FAILED');
    }
  }

  @Get('me')
  me(
    @UserRequest() user: UserAuthenticated,
    @XAccountRequest() xAccount: string,
  ) {
    return { user, xAccount };
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
  async onlyPermsPostRead(@AclRequest() acl: AclContext) {
    return {
      message: 'Authorized',
      roles: acl.getRoles(),
    };
  }
}
