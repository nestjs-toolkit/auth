import { Module } from '@nestjs/common';
import { AUTH_USER_STORE, ToolkitAuthModule } from '@nestjs-toolkit/auth';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { FakeUserStoreService } from './auth/fake-user-store.service';

@Module({
  imports: [ToolkitAuthModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [
    {
      provide: AUTH_USER_STORE,
      useClass: FakeUserStoreService,
    },
  ],
})
export class AppModule {}
