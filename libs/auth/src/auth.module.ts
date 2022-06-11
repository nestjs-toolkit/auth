import { JwtModule } from '@nestjs/jwt';
import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies';
import { AuthService } from './auth.service';
import {
  AuthConfig,
  AuthModuleAsyncOptions,
  AuthOptionsFactory,
} from './auth.interface';
import { AUTH_CONFIG } from './constants';
import { AclService } from './acl';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';

const defaultConfig: Partial<AuthConfig> = {
  jwtSignOptions: {
    audience: 'api-toolkit',
    expiresIn: '30m',
  },
};

@Module({})
export class ToolkitAuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    const customConfig = this.makeConfigure(config);

    return {
      module: ToolkitAuthModule,
      imports: [
        PassportModule,
        JwtModule.register({
          secret: customConfig.jwtSecret,
          signOptions: customConfig.jwtSignOptions,
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

  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    let authConfigProvider: Provider;

    if (options.useFactory) {
      authConfigProvider = {
        provide: AUTH_CONFIG,
        useFactory: async (...args: any[]) => await options.useFactory(...args),
        inject: options.inject || [],
      };
    } else {
      authConfigProvider = {
        provide: AUTH_CONFIG,
        useFactory: async (optionsFactory: AuthOptionsFactory) =>
          await optionsFactory.createOptions(),
        inject: [options.useExisting || options.useClass],
      };
    }

    return {
      module: ToolkitAuthModule,
      imports: [
        ...(options.imports || []),
        PassportModule,
        JwtModule.registerAsync({
          useFactory: async (conf: AuthConfig) => {
            return {
              secret: conf.jwtSecret,
              signOptions: conf.jwtSignOptions,
            };
          },
          inject: [AUTH_CONFIG],
        }),
      ],
      providers: [authConfigProvider, JwtStrategy, AuthService, AclService],
      exports: [authConfigProvider, AuthService, AclService],
      global: true,
    };
  }

  private static makeConfigure(config: AuthConfig): AuthConfig {
    return {
      ...defaultConfig,
      ...config,
      jwtSignOptions: Object.assign(
        {},
        defaultConfig.jwtSignOptions,
        config.jwtSignOptions,
      ),
    };
  }
}
