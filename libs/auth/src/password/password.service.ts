import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  remind(username: string): Promise<string> {
    return Promise.resolve('');
  }

  reset(token: string, newPassword: string): Promise<string> {
    return Promise.resolve('');
  }
}
