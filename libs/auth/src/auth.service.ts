import * as bcrypt from 'bcrypt';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';
import { UnauthorizedException } from '@nestjs-toolkit/base/exceptions';
import { IUserStore, UserAuthenticated } from './user';
import { AUTH_USER_STORE } from './constants';

type JwtResponse = { accessToken: string; expiresIn: number };

@Injectable()
export class AuthService implements OnModuleInit {
  private userStore: IUserStore;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly jwtService: JwtService,
  ) {}

  public onModuleInit() {
    this.userStore = this.moduleRef.get(AUTH_USER_STORE, { strict: false });
  }

  public async login(
    username: string,
    password: string,
  ): Promise<UserAuthenticated> {
    const user = await this.userStore.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password', 'INVALID_PASSWORD');
    }

    return user;
  }

  public async loginJwt(
    username: string,
    password: string,
  ): Promise<JwtResponse> {
    const user = await this.login(username, password);
    return this.signJwt(user);
  }

  public signJwt(
    user: UserAuthenticated,
    additionalPayload?: any,
    options?: JwtSignOptions,
  ): JwtResponse {
    const payload = this.userStore.presentJwtPayload(user, additionalPayload);
    payload.user.id = undefined;

    const token = this.jwtService.sign(payload, {
      subject: user.id,
      ...options,
      // todo get from config
    });

    const decoded: any = this.jwtService.decode(token);

    return {
      expiresIn: decoded.exp * 1000,
      accessToken: token,
    };
  }

  async register(
    username: string,
    password: string,
    data?: Record<string, any>,
  ): Promise<UserAuthenticated> {
    const hash = await this.hashPassword(password);
    return this.userStore.create(username, hash, data);
  }

  async updateUsername(id: string, username: string): Promise<boolean> {
    return this.userStore.updateUsername(id, username);
  }

  async updatePassword(id: string, password: string): Promise<boolean> {
    const hash = await this.hashPassword(password);
    return this.userStore.updatePassword(id, hash);
  }

  async updateRequiredAction(
    id: string,
    changePassword: string,
  ): Promise<boolean> {
    return this.userStore.updateRequiredAction(id, changePassword);
  }

  async updateAccount(id: string, account: string): Promise<boolean> {
    return this.userStore.updateAccount(id, account);
  }

  async updateRoles(id: string, roles: string[]): Promise<boolean> {
    return this.userStore.updateRoles(id, roles);
  }

  async findById(id: string): Promise<UserAuthenticated> {
    return this.userStore.findById(id);
  }

  async findByUsername(username: string): Promise<UserAuthenticated> {
    return this.userStore.findByUsername(username);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    return bcrypt.compare(password, hash);
  }

  private async hashPassword(password: string): Promise<string> {
    // const salt = await bcrypt.genSalt();
    const saltOrRounds = '$2b$10$E1rzRMj1XcEFTlCfdk0XCO'; // TODO get from config
    return bcrypt.hash(password, saltOrRounds);
  }
}
