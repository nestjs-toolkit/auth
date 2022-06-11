import { SignOptions } from 'jsonwebtoken';

export interface AuthConfig {
  jwtSecret: string;
  jwtSignOptions?: SignOptions;
  saltPassword: string;
}
