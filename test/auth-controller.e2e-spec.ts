import { InjectOptions } from 'light-my-request';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AuthService } from '@nestjs-toolkit/auth';
import { UserAuthenticated } from '@nestjs-toolkit/auth/user';
import { AppModule } from '../src/app.module';

type Response = {
  statusCode: number;
  body: any;
};

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;
  let user: UserAuthenticated;

  const request = (opts: InjectOptions): Promise<Response> => {
    return app.inject(opts).then((response) => ({
      statusCode: response.statusCode,
      body: response.json(),
    }));
  };

  const requestLogin = (
    username: string,
    password: string,
  ): Promise<Response> => {
    return request({
      method: 'POST',
      url: '/auth/login',
      payload: { username, password },
    });
  };

  const requestRegister = (dto: any): Promise<Response> => {
    return request({
      method: 'POST',
      url: '/auth/register',
      payload: dto,
    });
  };

  const requestMe = (accessToken?: string): Promise<Response> => {
    return request({
      method: 'GET',
      url: '/auth/me',
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    authService = app.get(AuthService);

    user = await authService.register('admin', '123456', {
      roles: ['ADMIN'],
      account: 'x1x2x3',
    });
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

      const { body, statusCode } = await requestRegister(dto);

      expect(statusCode).toBe(201);
      expect(body.username).toBe(dto.username);
    });

    it('User already exists', async () => {
      const dto = {
        username: user.username,
        password: '1234',
      };

      const { body, statusCode } = await requestRegister(dto);

      expect(statusCode).toBe(500);
      expect(body.message).toBe('User already exists');
    });
  });

  describe('/login (POST)', () => {
    it('Success', async () => {
      const { body, statusCode } = await requestLogin(user.username, '123456');

      expect(statusCode).toBe(200);
      expect(body.accessToken).toBeDefined();
      expect(body.expiresIn).toBeDefined();
    });

    it('Invalid args min password', async () => {
      const { body, statusCode } = await requestLogin(user.username, '123');

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Invalid credentials');
    });

    it('Invalid args min username', async () => {
      const { body, statusCode } = await requestLogin('sss', '123456');

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Invalid credentials');
    });

    it('User disabled', async () => {
      const dto = {
        username: 'topgun',
        password: 'F18@Gun',
      };

      await authService.register(dto.username, dto.password, {
        deletedAt: new Date(),
      });

      const { body, statusCode } = await requestLogin(
        dto.username,
        dto.password,
      );

      expect(statusCode).toBe(401);
      expect(body.message).toBe('User is disabled');
    });

    it('Invalid Username', async () => {
      const { body, statusCode } = await requestLogin('xxxxxx', 'xxxxxx');

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Login or password is incorrect');
    });

    it('Invalid Password', async () => {
      const { body, statusCode } = await requestLogin(user.username, 'xxxxxx');

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Login or password is incorrect');
    });

    it('Empty Password', async () => {
      const { body, statusCode } = await requestLogin(user.username, '');

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Invalid credentials');
    });
  });

  describe('/me (GET)', () => {
    it('Empty token', async () => {
      const { body, statusCode } = await requestMe();

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Unauthorized');
    });

    it('Expired token', async () => {
      const { accessToken } = authService.signJwt(user, null, {
        expiresIn: '-1m',
      });

      const { statusCode } = await requestMe(accessToken);

      expect(statusCode).toBe(401);
    });

    it('Success with signJwt', async () => {
      const { accessToken } = authService.signJwt(user);
      const { body, statusCode } = await requestMe(accessToken);

      expect(statusCode).toBe(200);
      expect(body.user.id).toBe(user.id);
      expect(body.user.username).toBe(user.username);
      expect(body.xAccount).toBe(user.xAccount);
    });

    it('Success with loginJwt', async () => {
      const { accessToken } = await authService.loginJwt(
        user.username,
        '123456',
      );

      const { body, statusCode } = await requestMe(accessToken);

      expect(statusCode).toBe(200);
      expect(body.user.id).toBe(user.id);
      expect(body.user.username).toBe(user.username);
      expect(body.xAccount).toBe(user.xAccount);
    });

    it('JWT Audience invalid', async () => {
      const { accessToken } = authService.signJwt(user, null, {
        audience: 'other-aud',
      });

      const { statusCode } = await requestMe(accessToken);

      expect(statusCode).toBe(401);
    });
  });
});
