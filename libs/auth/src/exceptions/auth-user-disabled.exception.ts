import { AuthException } from './auth.exception';

export class AuthUserDisabledException extends AuthException {
  public readonly reason: 'USER_IS_DISABLED';
  public readonly errorCode: 'USER_IS_DISABLED';

  constructor() {
    super('User is disabled');
  }
}
