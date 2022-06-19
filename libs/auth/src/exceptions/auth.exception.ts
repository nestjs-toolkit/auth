export class AuthException extends Error {
  readonly isAuthErro = true;
  readonly reason: string;
  readonly errorCode: string;

  constructor(message: string) {
    super(message);
  }
}
