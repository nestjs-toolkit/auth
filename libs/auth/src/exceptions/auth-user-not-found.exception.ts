import { AuthException } from './auth.exception';

export class AuthUserNotFoundException extends AuthException {
  public readonly reason: 'USER_NOT_FOUND';
  public readonly errorCode: 'INVALID_USERNAME_PASSWORD';

  constructor() {
    super('Login or password is incorrect');
  }
}
