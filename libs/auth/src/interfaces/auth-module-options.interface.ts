import { SignOptions } from 'jsonwebtoken';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface AuthModuleOptions {
  jwtSecret: string;
  jwtSignOptions?: SignOptions;
  saltPassword: string;
}

export interface AuthOptionsFactory {
  createOptions(): Promise<AuthModuleOptions> | AuthModuleOptions;
}

export interface AuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AuthOptionsFactory>;
  useClass?: Type<AuthOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<AuthModuleOptions> | AuthModuleOptions;
  inject?: any[];
}
