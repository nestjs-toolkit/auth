import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfig } from '@nestjs-toolkit/auth/auth.interface';
import { AUTH_CONFIG } from '@nestjs-toolkit/auth/constants';
import { JwtStrategy } from '@nestjs-toolkit/auth/strategies';

@Module({
  imports: [
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
  providers: [JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class CoreAuthModule {}
