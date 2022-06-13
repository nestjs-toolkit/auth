import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AUTH_USER_STORE, ToolkitAuthModule } from '@nestjs-toolkit/auth';
import { AclGuard, JwtAuthGuard } from '@nestjs-toolkit/auth/guards';
import { FakeUserStore } from './auth/fake-user.store';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ToolkitAuthModule.forRoot({
      jwtSecret: 'jwt-secret',
      jwtSignOptions: {
        expiresIn: '3m',
        audience: 'test-audience',
      },
      saltPassword: '$2b$10$E1rzRMj1XcEFTlCfdk0XCO',
    }),
    AuthModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: AUTH_USER_STORE,
      useClass: FakeUserStore,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AclGuard,
    },
  ],
})
export class AppModule {}
