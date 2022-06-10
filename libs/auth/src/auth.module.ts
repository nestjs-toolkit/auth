import { JwtModule } from '@nestjs/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PasswordService } from './password';
import { JwtStrategy } from './strategies';
import { AuthService } from './auth.service';
import { AuthConfig } from './auth.config';
import { AUTH_CONFIG } from './constants';

const defaultConfig: AuthConfig = {
  jwtSecret: 'secret-test',
  jwtSignOptions: {
    audience: 'api-toolkit',
    expiresIn: '1h',
  },
};

@Module({})
export class ToolkitAuthModule {
  static forRoot(config?: Partial<AuthConfig>): DynamicModule {
    const customConfig = {
      ...defaultConfig,
      config,
      jwtSignOptions: {
        ...defaultConfig.jwtSignOptions,
        ...config?.jwtSignOptions,
      },
    };

    return {
      module: ToolkitAuthModule,
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          useFactory() {
            return {
              secret: customConfig.jwtSecret,
              signOptions: customConfig.jwtSignOptions,
            };
          },
        }),
      ],
      providers: [
        {
          provide: AUTH_CONFIG,
          useValue: customConfig,
        },
        JwtStrategy,
        AuthService,
        PasswordService,
      ],
      exports: [AuthService, PasswordService, JwtStrategy],
      global: true,
    };
  }
}
