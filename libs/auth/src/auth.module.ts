import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { AuthService } from './auth.service';
import {
  AuthConfig,
  AuthModuleAsyncOptions,
  AuthOptionsFactory,
} from './auth.interface';
import { CoreAuthModule } from './core-auth.module';
import { AUTH_CONFIG } from './constants';
import { AclService } from './acl';

const defaultConfig: Partial<AuthConfig> = {
  jwtSignOptions: {
    audience: 'api-toolkit',
    expiresIn: '30m',
  },
};

@Module({
  providers: [AuthService, AclService],
  exports: [AuthService, AclService],
})
export class ToolkitAuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    const customConfig = this.makeConfigure(config);

    return {
      module: ToolkitAuthModule,
      imports: [CoreAuthModule],
      providers: [
        {
          provide: AUTH_CONFIG,
          useValue: customConfig,
        },
      ],
      exports: [AUTH_CONFIG],
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
      imports: [...(options.imports || []), CoreAuthModule],
      providers: [authConfigProvider],
      exports: [authConfigProvider],
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
