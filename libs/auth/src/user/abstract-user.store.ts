import { UserAuthenticated, UserEntity } from './user.type';
import { IUserStore } from './i-user.store';

export abstract class AbstractUserStore implements IUserStore {
  abstract create(
    username: string,
    passwordHash: string,
    data?: Record<string, any>,
  ): Promise<UserAuthenticated>;

  abstract findById(id: string): Promise<UserEntity>;

  abstract findByUsername(username: string): Promise<UserEntity>;

  abstract update(
    id: string,
    data: Partial<UserEntity>,
  ): Promise<UserAuthenticated>;

  abstract updateUsername(id: string, username: string): Promise<boolean>;

  updateRequiredAction(id: string, action: string): Promise<boolean> {
    return this.update(id, { requiredAction: action }).then(() => true);
  }

  updateRoles(id: string, roles: string[]): Promise<boolean> {
    return this.update(id, { roles }).then(() => true);
  }

  updateXAccount(id: string, account: string): Promise<boolean> {
    return this.update(id, { xAccount: account }).then(() => true);
  }

  updatePassword(id: string, passwordHash: string): Promise<boolean> {
    return this.update(id, { password: passwordHash }).then(() => true);
  }

  presentJwtPayload(
    user: UserAuthenticated,
    additionalPayload?: Record<string, any>,
  ): Record<string, any> {
    return {
      xAccount: user.xAccount?.toString(),
      ...additionalPayload,
      user: {
        username: user.username,
        roles: user.roles,
      },
    };
  }
}
