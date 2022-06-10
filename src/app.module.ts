import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AUTH_USER_STORE, ToolkitAuthModule } from '@nestjs-toolkit/auth';
import { JwtAuthGuard } from '@nestjs-toolkit/auth/guards';
import { FakeUserStore } from './auth/fake-user.store';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ToolkitAuthModule.forRoot({
      jwtSecret: 'jwt-secret',
      jwtSignOptions: {
        audience: 'test-audience',
      },
    }),
    AuthModule,
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
    // TODO: add AclGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: AclGuard,
    // },
  ],
})
export class AppModule {}
