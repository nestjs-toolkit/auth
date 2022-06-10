import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { AbstractUserStore, User, UserDto } from '@nestjs-toolkit/auth/user';

const DATA_USER: Array<User> = [];

@Injectable()
export class FakeUserStore extends AbstractUserStore {
  async create(dto: UserDto, passwordHash: string): Promise<User> {
    const hasUser = await this.findByUsername(dto.username);

    if (hasUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      ...dto,
      id: randomUUID(),
      password: passwordHash,
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
}
