import { User } from './user';
import { IUserStore } from './i-user.store';

export abstract class AbstractUserStore implements IUserStore {
  abstract create(
    username: string,
    passwordHash: string,
    data?: Record<string, any>,
  ): Promise<User>;

  abstract findById(id: string): Promise<User>;

  abstract findByUsername(username: string): Promise<User>;

  abstract update(id: string, data: Partial<User>): Promise<User>;

  abstract updateUsername(id: string, username: string): Promise<boolean>;

  updateRequiredAction(id: string, action: string): Promise<boolean> {
    return this.update(id, { requiredAction: action }).then(() => true);
  }

  updateRoles(id: string, roles: string[]): Promise<boolean> {
    return this.update(id, { roles }).then(() => true);
  }

  updateWorkspace(id: string, workspace: string): Promise<boolean> {
    return this.update(id, { workspace }).then(() => true);
  }

  updatePassword(id: string, passwordHash: string): Promise<boolean> {
    return this.update(id, { password: passwordHash }).then(() => true);
  }

  presentJwtPayload(
    user: User,
    additionalPayload?: Record<string, any>,
  ): Record<string, any> {
    return {
      workspace: user.workspace?.toString(),
      ...additionalPayload,
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
    };
  }
}
