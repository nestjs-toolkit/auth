import { JwtModule } from '@nestjs/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies';
import { AuthService } from './auth.service';
import { AuthConfig } from './auth.config';
import { AUTH_CONFIG } from './constants';
import { AclService } from './acl';

const defaultConfig: Partial<AuthConfig> = {
  jwtSignOptions: {
    audience: 'api-toolkit',
    expiresIn: '30m',
  },
};

@Module({})
export class ToolkitAuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    const customConfig = {
      ...defaultConfig,
      ...config,
      jwtSignOptions: Object.assign(
        {},
        defaultConfig.jwtSignOptions,
        config.jwtSignOptions,
      ),
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
        AclService,
      ],
      exports: [AuthService, AclService],
      global: true,
    };
  }
}
