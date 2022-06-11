import { Provider } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt';
import { AuthModuleOptions } from './interfaces';
import { AUTH_MODULE_OPTIONS } from './constants';

const defaultConfig: Partial<AuthModuleOptions> = {
  jwtSignOptions: {
    audience: 'api-toolkit',
    expiresIn: '30m',
  },
};

export function createAuthProvider(options: AuthModuleOptions): Provider {
  const value = {
    ...defaultConfig,
    ...options,
    jwtSignOptions: Object.assign(
      {},
      defaultConfig.jwtSignOptions,
      options.jwtSignOptions,
    ),
  };

  return { provide: AUTH_MODULE_OPTIONS, useValue: value };
}

export function authToJwtModuleOptions(
  options: AuthModuleOptions,
): JwtModuleOptions {
  return {
    secret: options.jwtSecret,
    signOptions: options.jwtSignOptions,
  };
}
