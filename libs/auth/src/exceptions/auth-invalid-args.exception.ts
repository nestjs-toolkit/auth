import { AuthException } from './auth.exception';

export class AuthInvalidArgsException extends AuthException {
  public readonly internalReason = 'INVALID_CREDENTIALS';
  public readonly errorCode = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid credentials');
  }
}
