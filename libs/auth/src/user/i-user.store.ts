import { UserAuthenticated, UserEntity } from './user.type';

export interface IUserStore {
  findById(id: string): Promise<UserEntity>;

  findByUsername(username: string): Promise<UserEntity>;

  create(
    username: string,
    passwordHash: string,
    data?: Record<string, any>,
  ): Promise<UserAuthenticated>;

  updateUsername(id: string, username: string): Promise<boolean>;

  updatePassword(id: string, passwordHash: string): Promise<boolean>;

  updateRoles(id: string, roles: string[]): Promise<boolean>;

  updateAccount(id: string, account: string): Promise<boolean>;

  updateRequiredAction(id: string, action: string): Promise<boolean>;

  presentJwtPayload(
    user: UserAuthenticated,
    additionalPayload?: Record<string, any>,
  ): Record<string, any>;
}
