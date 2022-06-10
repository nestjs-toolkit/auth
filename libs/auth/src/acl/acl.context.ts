export class AclContext {
  constructor(
    readonly roles: string[],
    private readonly permissions: string[],
  ) {}

  getRoles(): string[] {
    return this.roles.slice();
  }

  getPermissions(): string[] {
    return this.permissions.slice();
  }

  hasRole(...roles: string[]): boolean {
    return roles.find((r) => this.roles.includes(r)) !== undefined;
  }

  everyRole(...roles: string[]): boolean {
    return roles.every((r) => this.roles.includes(r));
  }

  hasPermission(...permission: string[]): boolean {
    return permission.find((p) => this.permissions.includes(p)) !== undefined;
  }

  everyPermission(...permission: string[]): boolean {
    return permission.every((p) => this.permissions.includes(p));
  }
}
