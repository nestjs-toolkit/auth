import { User } from './user';

export interface IUserStore {
  findById(id: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
  create(
    username: string,
    passwordHash: string,
    data?: Record<string, any>,
  ): Promise<User>;
  updateUsername(id: string, username: string): Promise<boolean>;
  updatePassword(id: string, passwordHash: string): Promise<boolean>;
  updateRoles(id: string, roles: string[]): Promise<boolean>;
  updateWorkspace(id: string, workspace: string): Promise<boolean>;
  updateRequiredAction(id: string, action: string): Promise<boolean>;
  presentJwtPayload(
    user: User,
    additionalPayload?: Record<string, any>,
  ): Record<string, any>;
}
