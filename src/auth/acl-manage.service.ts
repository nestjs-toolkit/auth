import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AclService } from '@nestjs-toolkit/auth';
import { PermissionEnum, RoleEnum } from './enum';

@Injectable()
export class AclManageService implements OnApplicationBootstrap {
  constructor(private readonly aclData: AclService) {}

  onApplicationBootstrap(): any {
    this.aclData.addRole(RoleEnum.Webmaster, [
      PermissionEnum.UserWrite,
      PermissionEnum.UserRead,
      PermissionEnum.PostWrite,
      PermissionEnum.PostRead,
    ]);

    this.aclData.addRole(RoleEnum.User, [
      PermissionEnum.PostRead,
      PermissionEnum.UserRead,
    ]);
  }
}
