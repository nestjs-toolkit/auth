import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs-toolkit/base/exceptions';
import { ExtractContext } from '@nestjs-toolkit/base/context';
import { META_AUTH_PUBLIC } from '../decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('toolkit_jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    return ExtractContext.getRequest(context);
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      META_AUTH_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      this.logger.error(err);
      this.logger.error(info);
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
