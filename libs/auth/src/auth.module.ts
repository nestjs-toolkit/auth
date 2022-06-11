import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { authToJwtModuleOptions, createAuthProvider } from './auth.providers';
import { AuthService } from './auth.service';
import {
  AuthModuleAsyncOptions,
  AuthModuleOptions,
  AuthOptionsFactory,
} from './interfaces';
import { AUTH_MODULE_OPTIONS } from './constants';
import { JwtStrategy } from './strategies';
import { AclService } from './acl';

@Global()
@Module({
  providers: [AuthService, AclService, JwtStrategy],
  exports: [AuthService, AclService],
})
export class ToolkitAuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: ToolkitAuthModule,
      imports: [PassportModule, this.makeJwtModule(options)],
      providers: [createAuthProvider(options)],
    };
  }

  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: ToolkitAuthModule,
      imports: [...options.imports, this.makeJwtModuleAsync(options)],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(
    options: AuthModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: AuthModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: AUTH_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: AUTH_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AuthOptionsFactory) =>
        await optionsFactory.createOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  private static makeJwtModule(options: AuthModuleOptions) {
    return JwtModule.register(authToJwtModuleOptions(options));
  }

  private static makeJwtModuleAsync(asyncOptions: AuthModuleAsyncOptions) {
    if (asyncOptions.useFactory) {
      return JwtModule.registerAsync({
        imports: asyncOptions.imports,
        useFactory: async (...args: any[]) => {
          const options = await asyncOptions.useFactory(...args);
          return authToJwtModuleOptions(options);
        },
        inject: asyncOptions.inject || [],
      });
    }

    return JwtModule.registerAsync({
      imports: asyncOptions.imports,
      useFactory: async (optionsFactory: AuthOptionsFactory) => {
        const options = await optionsFactory.createOptions();
        return authToJwtModuleOptions(options);
      },
      inject: [asyncOptions.useExisting || asyncOptions.useClass],
    });
  }
}
