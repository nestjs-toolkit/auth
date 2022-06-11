import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthConfig } from '../auth.interface';
import { AUTH_CONFIG } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'toolkit_jwt') {
  constructor(
    @Inject(AUTH_CONFIG)
    private readonly config: AuthConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
      audience: config.jwtSignOptions.audience,
    });
  }

  validate(payload: any): any {
    return { id: payload.sub, ...payload.user };
  }
}
