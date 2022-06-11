import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AuthService } from '@nestjs-toolkit/auth';
import { UserAuthenticated } from '@nestjs-toolkit/auth/user';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;
  let user: UserAuthenticated;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    authService = app.get(AuthService);

    user = await authService.register('admin', '123456', { roles: ['ADMIN'] });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/register (POST)', () => {
    it('Success', async () => {
      const dto = {
        username: 'test',
        password: '1234',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: dto,
      });
      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(201);
      expect(body.username).toBe(dto.username);
    });

    it('User already exists', async () => {
      const dto = {
        username: user.username,
        password: '1234',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: dto,
      });
      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(500);
      expect(body.message).toBe('User already exists');
    });
  });

  describe('/login (POST)', () => {
    it('Success', async () => {
      const dto = {
        username: user.username,
        password: '123456',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: dto,
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(200);
      expect(body.accessToken).toBeDefined();
      expect(body.expiresIn).toBeDefined();
    });

    it('Invalid Username', async () => {
      const dto = {
        username: 'xxxxxx',
        password: 'xxxxxx',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: dto,
      });
      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(401);
      expect(body.message).toBe('Login or password is incorrect');
    });
    it('Invalid Password', async () => {
      const dto = {
        username: user.username,
        password: 'xxxxxx',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: dto,
      });
      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(401);
      expect(body.message).toBe('Login or password is incorrect');
    });

    it('Empty Password', async () => {
      const dto = {
        username: user.username,
        password: '',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: dto,
      });
      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(401);
      expect(body.message).toBe('Login or password is incorrect');
    });
  });

  describe('/me (GET)', () => {
    it('Empty token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(401);
    });

    it('Expired token', async () => {
      const { accessToken } = authService.signJwt(user, null, {
        expiresIn: '-1m',
      });

      console.log(accessToken);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(401);
    });

    it('Success with signJwt', async () => {
      const { accessToken } = authService.signJwt(user);

      console.log(accessToken);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(user.id);
      expect(body.username).toBe(user.username);
    });

    it('Success with loginJwt', async () => {
      const { accessToken } = await authService.loginJwt(
        user.username,
        '123456',
      );

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(user.id);
      expect(body.username).toBe(user.username);
    });

    it('JWT Audience invalid', async () => {
      const { accessToken } = authService.signJwt(user, null, {
        audience: 'invalid',
      });

      console.log(accessToken);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(401);
    });
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

    it('Update Account', async () => {
      const account = 'x1x2x3';
      const result = await authService.updateAccount(user.id, account);
      expect(result).toBeTruthy();

      const response = await authService.findById(user.id);
      expect(response.account).toBe(account);
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

    it('Find id not found', async () => {
      const response = await authService.findById('xpto');
      expect(response).toBeNull();
    });

    it('Find username not found', async () => {
      const response = await authService.findByUsername('xpto');
      expect(response).toBeNull();
    });
  });
});
