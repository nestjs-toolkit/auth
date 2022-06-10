import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { AuthService } from '@nestjs-toolkit/auth';
import { User } from '@nestjs-toolkit/auth/user';

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;
  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    await app.init();
    //await app.getHttpAdapter().getInstance().ready();

    authService = app.get(AuthService);

    user = await authService.register(
      {
        username: 'admin',
        roles: ['ADMIN'],
      },
      '123456',
    );
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
    it('Invalid credentials', async () => {
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

    it('Success', async () => {
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
  });
});
