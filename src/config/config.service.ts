import { Injectable } from '@nestjs/common';
import {
  AuthConfig,
  AuthOptionsFactory,
} from '@nestjs-toolkit/auth/auth.interface';

@Injectable()
export class ConfigService implements AuthOptionsFactory {
  createOptions(): AuthConfig {
    return {
      jwtSecret: 'jwt-secret-factory',
      saltPassword: 'salt-factory',
      jwtSignOptions: {
        audience: 'fake-audience-123',
      },
    };
  }
}
