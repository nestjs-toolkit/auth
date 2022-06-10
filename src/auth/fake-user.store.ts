import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { AbstractUserStore, User } from '@nestjs-toolkit/auth/user';

const DATA_USER: Array<User> = [];

@Injectable()
export class FakeUserStore extends AbstractUserStore {
  async create(
    username: string,
    passwordHash: string,
    data?: Record<string, any>,
  ): Promise<User> {
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

    return Promise.resolve(newUser);
  }

  async findById(id: string): Promise<User> {
    return DATA_USER.find((u) => u.id === id) || null;
  }

  async findByUsername(username: string): Promise<User> {
    return DATA_USER.find((u) => u.username === username) || null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const indexOfUser = DATA_USER.findIndex((u) => u.id === id);

    if (indexOfUser === -1) {
      throw new Error('User not found');
    }

    DATA_USER[indexOfUser] = {
      ...DATA_USER[indexOfUser],
      ...data,
    };

    return DATA_USER[indexOfUser];
  }

  async updateUsername(id: string, username: string): Promise<boolean> {
    const hasUser = await this.findByUsername(username);

    if (hasUser) {
      throw new Error('Username already exists');
    }

    return this.update(id, { username }).then(() => true);
  }
}
