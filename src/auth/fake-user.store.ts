import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  AbstractUserStore,
  UserAuthenticated,
  UserEntity,
} from '@nestjs-toolkit/auth/user';

const DATA_USER: Array<UserEntity> = [];

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

    const newUser: UserEntity = {
      id: randomUUID(),
      username,
      password: passwordHash,
      ...data,
    };

    DATA_USER.push(newUser);

    return Promise.resolve(new UserAuthenticated(newUser));
  }

  async findById(id: string): Promise<UserEntity> {
    return DATA_USER.find((u) => u.id === id) || null;
  }

  async findByUsername(username: string): Promise<UserEntity> {
    return DATA_USER.find((u) => u.username === username) || null;
  }

  async update(
    id: string,
    data: Partial<UserAuthenticated>,
  ): Promise<UserAuthenticated> {
    const indexOfUser = DATA_USER.findIndex((u) => u.id === id);

    if (indexOfUser === -1) {
      throw new Error('User not found');
    }

    DATA_USER[indexOfUser] = {
      ...DATA_USER[indexOfUser],
      ...data,
    };

    return new UserAuthenticated(DATA_USER[indexOfUser]);
  }

  async updateUsername(id: string, username: string): Promise<boolean> {
    const hasUser = await this.findByUsername(username);

    if (hasUser) {
      throw new Error('Username already exists');
    }

    return this.update(id, { username }).then(() => true);
  }
}
