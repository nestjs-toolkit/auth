import { AuthException } from './auth.exception';

export class AuthInvalidPasswordException extends AuthException {
  public readonly reason: 'INVALID_PASSWORD';
  public readonly errorCode: 'INVALID_USERNAME_PASSWORD';

  constructor() {
    super('Login or password is incorrect');
  }
}
