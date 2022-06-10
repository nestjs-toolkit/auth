import { User } from './user';
import { UserDto } from './user.dto';

export interface IUserStore {
  findById(id: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
  create(dto: UserDto, passwordHash: string): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<boolean>;
  updateRoles(id: string, roles: string[]): Promise<boolean>;
  updateWorkspace(id: string, workspace: string): Promise<boolean>;
  updateRequiredAction(id: string, action: string): Promise<boolean>;
  presentJwtPayload(
    user: User,
    additionalPayload?: Record<string, any>,
  ): Record<string, any>;
}
