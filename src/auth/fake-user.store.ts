import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  AbstractUserStore,
  UserAuthenticated,
  UserEntity,
} from '@nestjs-toolkit/auth/user';

type User = {
  id: string;
  username: string;
  roles?: string[];
  account?: string;
  requiredAction?: string;
  password: string;
  deletedAt?: Date;
};

const DATA_USER: Array<User> = [];

@Injectable()
export class FakeUserStore extends AbstractUserStore {
  async create(
    username: string,
    passwordHash: string,
    data?: Record<string, any>,
  ): Promise<UserAuthenticated> {
    const hasUser = await this.findByUsername(username);

    if (hasUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: randomUUID(),
      username,
      password: passwordHash,
      ...data,
    };

    DATA_USER.push(newUser);

    return Promise.resolve(this.presentUserAuthenticated(newUser));
  }

  async findById(id: string): Promise<UserEntity> {
    return this.presentUserEntity(DATA_USER.find((u) => u.id === id));
  }

  async findByUsername(username: string): Promise<UserEntity> {
    return this.presentUserEntity(
      DATA_USER.find((u) => u.username === username),
    );
  }

  async update(
    id: string,
    data: Partial<UserAuthenticated>,
  ): Promise<UserAuthenticated> {
    const indexOfUser = DATA_USER.findIndex((u) => u.id === id);

    if (indexOfUser === -1) {
      throw new Error('User not found');
    }

    const dataUser: Partial<User> = { ...data };

    if (data.xAccount) {
      delete dataUser['xAccount'];
      dataUser.account = data.xAccount;
    }

    DATA_USER[indexOfUser] = {
      ...DATA_USER[indexOfUser],
      ...dataUser,
    };

    return this.presentUserAuthenticated(DATA_USER[indexOfUser]);
  }

  async updateUsername(id: string, username: string): Promise<boolean> {
    const hasUser = await this.findByUsername(username);

    if (hasUser) {
      throw new Error('Username already exists');
    }

    return this.update(id, { username }).then(() => true);
  }

  private presentUserAuthenticated(user: User): UserAuthenticated {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      requiredAction: user.requiredAction,
      roles: user.roles,
      xAccount: user.account?.toString(),
    };
  }

  private presentUserEntity(user: User): UserEntity {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      requiredAction: user.requiredAction,
      roles: user.roles,
      xAccount: user.account?.toString(),
      password: user.password,
      isEnable: !user.deletedAt,
    };
  }
}
