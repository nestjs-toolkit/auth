import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@nestjs-toolkit/auth';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'toolkit_jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authService.getConfig().jwtSecret,
      audience: authService.getConfig().jwtSignOptions.audience,
    });
  }

  validate(payload: any): any {
    return payload;
    // return { id: payload.sub, ...payload.user };
  }
}
