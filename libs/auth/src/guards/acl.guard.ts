import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ExtractContext } from '@nestjs-toolkit/base/context';
import { UnauthorizedException } from '@nestjs-toolkit/base/exceptions';
import { META_ACL_PERMS, META_ACL_ROLES } from '../decorators';
import { AclService } from '../acl';

@Injectable()
export class AclGuard implements CanActivate {
  constructor(private reflector: Reflector, private aclService: AclService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = ExtractContext.getRequest(context);
    const user = req.user;
    const acl = this.aclService.makeContext(user?.roles);

    if (ExtractContext.isGql(context)) {
      const ctx = ExtractContext.getContext(context);
      ctx.user = user;
      ctx.acl = acl;
    } else {
      req.acl = acl;
    }

    const checkPerms = this.reflector.getAllAndOverride<string[]>(
      META_ACL_PERMS,
      [context.getHandler(), context.getClass()],
    );

    const checkRoles = this.reflector.getAllAndOverride<string[]>(
      META_ACL_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!checkPerms?.length && !checkRoles?.length) {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
        'USER_NOT_SET_IN_CONTEXT',
      );
    }

    if (checkPerms?.length && !acl.hasPermission(...checkPerms)) {
      throw new UnauthorizedException(
        `Requer permissão especial: ${checkPerms.join(', ')}`,
        'ACL_PERMS',
        403,
        { perms: checkPerms },
      );
    }

    if (checkRoles?.length && !acl.hasRole(...checkRoles)) {
      throw new UnauthorizedException(
        `Requer nível de acesso especial: ${checkRoles.join(', ')}`,
        'ACL_ROLE',
        403,
        { roles: checkRoles },
      );
    }

    return true;
  }
}
