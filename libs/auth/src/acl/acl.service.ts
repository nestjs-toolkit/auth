import { Injectable } from '@nestjs/common';
import { AclContext } from '@nestjs-toolkit/auth/acl/acl.context';

@Injectable()
export class AclService {
  private data: Map<string, Array<string>> = new Map();
  private cachePerms: Map<string, Array<string>> = new Map();

  addRole(role: string, permissions: Array<string>): void {
    this.data.set(role, permissions);
    this.cachePerms.clear();
  }

  clear() {
    this.data.clear();
    this.cachePerms.clear();
  }

  getPermissions(): Array<string> {
    const permis = new Set<string>();

    this.data.forEach((permissions) => {
      permissions.forEach((permission) => {
        permis.add(permission);
      });
    });

    return new Array(...permis).sort((a, b) => a.localeCompare(b));
  }

  getRoles(): Array<string> {
    return new Array(...this.data.keys()).sort((a, b) => a.localeCompare(b));
  }

  getData() {
    return this.getRoles().map((role) => {
      return {
        role,
        permissions: this.getPermissionsByRoles([role]),
      };
    });
  }

  makeContext(roles: string[]): AclContext {
    if (!roles?.length) {
      return new AclContext([], []);
    }

    const perms = this.getPermissionsByRoles(roles);
    return new AclContext(roles, perms);
  }

  getPermissionsByRoles(roles: Array<string>): Array<string> {
    const key = roles.sort().join('-');

    if (this.cachePerms.has(key)) {
      return this.cachePerms.get(key);
    }

    const permissions = new Set<string>();

    roles.forEach((role) => {
      this.findPermissions(role).forEach((permission) => {
        permissions.add(permission);
      });
    });

    const permissionsSorted = new Array(...permissions).sort((a, b) =>
      a.localeCompare(b),
    );

    this.cachePerms.set(key, permissionsSorted);
    return permissionsSorted;
  }

  findPermissions(role: string): Array<string> {
    return this.data.get(role) || [];
  }
}
