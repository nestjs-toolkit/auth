import { Injectable } from '@nestjs/common';
import { AuthModuleOptions, AuthOptionsFactory } from '@nestjs-toolkit/auth';

@Injectable()
export class ConfigService implements AuthOptionsFactory {
  createOptions(): AuthModuleOptions {
    return {
      jwtSecret: 'jwt-secret-factory',
      saltPassword: 'salt-factory',
      jwtSignOptions: {
        audience: 'fake-audience-123',
      },
    };
  }
}
