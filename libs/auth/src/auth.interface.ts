import { SignOptions } from 'jsonwebtoken';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface AuthConfig {
  jwtSecret: string;
  jwtSignOptions?: SignOptions;
  saltPassword: string;
}

export interface AuthOptionsFactory {
  createOptions(): Promise<AuthConfig> | AuthConfig;
}

export interface AuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AuthOptionsFactory>;
  useClass?: Type<AuthOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AuthConfig> | AuthConfig;
  inject?: any[];
}
