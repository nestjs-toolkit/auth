import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AuthService } from '@nestjs-toolkit/auth';
import { UserAuthenticated } from '@nestjs-toolkit/auth/user';
import { AppModule } from '../src/app.module';

describe('AuthService (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;
  let user: UserAuthenticated;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    await app.init();

    authService = app.get(AuthService);

    user = await authService.register('admin', '123456', {
      roles: ['ADMIN'],
      account: 'x1x2x3',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Update user', () => {
    it('Update Username', async () => {
      const luke = await authService.register('luke', '123456');

      const username = 'bilu2';
      const result = await authService.updateUsername(luke.id, username);
      expect(result).toBeTruthy();

      const lukeUpdated = await authService.findById(luke.id);
      expect(lukeUpdated.username).toBe(username);
    });

    it('Update already username ', async () => {
      const luke = await authService.register('luke', '123456');
      const leia = await authService.register('leia', '123456');

      expect(
        authService.updateUsername(leia.id, luke.username),
      ).rejects.toThrow('Username already exists');
    });

    it('Update Password', async () => {
      const pwd = '121212';
      const result = await authService.updatePassword(user.id, pwd);
      expect(result).toBeTruthy();

      const response = await authService.login(user.username, pwd);
      expect(response.id).toBe(user.id);
    });

    it('Update Required Action', async () => {
      const action = 'change_password';
      const result = await authService.updateRequiredAction(user.id, action);
      expect(result).toBeTruthy();

      const response = await authService.findById(user.id);
      expect(response.requiredAction).toBe(action);
    });

    it('Update X-Account', async () => {
      const account = 'klomdert';
      const result = await authService.updateXAccount(user.id, account);
      expect(result).toBeTruthy();

      const response = await authService.findById(user.id);
      expect(response.xAccount).toBe(account);
    });

    it('Update Roles', async () => {
      const roles = ['admin', 'webmaster'];
      const result = await authService.updateRoles(user.id, roles);
      expect(result).toBeTruthy();

      const response = await authService.findById(user.id);
      expect(response.roles).toEqual(roles);
    });

    it('Update Id not found', async () => {
      expect(authService.updateRoles('xpto', [])).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('Find user', () => {
    it('Find by id not found', async () => {
      const response = await authService.findById('xpto');
      expect(response).toBeNull();
    });

    it('Find by username not found', async () => {
      const response = await authService.findByUsername('xpto');
      expect(response).toBeNull();
    });
  });
});
