export class AuthException extends Error {
  public internalReason = 'AUTH_EXCEPTION';
  public errorCode = 'AUTH_EXCEPTION';

  constructor(message: string) {
    super(message);
  }
}
