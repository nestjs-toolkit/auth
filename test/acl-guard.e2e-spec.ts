import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { AuthService } from '@nestjs-toolkit/auth';
import { RoleEnum } from '../src/auth/enum';

describe('Acl Guard (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    authService = app.get(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/acl/only-perms-post-write (GET)', () => {
    it('Empty token', async () => {
      const response = await app.inject('/auth/acl/only-perms-post-write');
      const body = response.json();

      expect(response.statusCode).toBe(401);
      expect(body.message).toBe('Unauthorized');
    });

    it('Authorized', async () => {
      const user = await authService.register('test-02', '123456', {
        roles: [RoleEnum.Webmaster],
      });
      const { accessToken } = await authService.signJwt(user);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/acl/only-perms-post-write',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(200);
      expect(body.message).toBe('Authorized');
    });

    it('Unauthorized', async () => {
      const user = await authService.register('test-03', '123456', {
        roles: [RoleEnum.User],
      });
      const { accessToken } = await authService.signJwt(user);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/acl/only-perms-post-write',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(403);
      expect(body.message).toBe('Requer permissão especial: post.write');
    });
  });

  describe('/auth/acl/only-role-user (GET)', () => {
    it('Empty token', async () => {
      const response = await app.inject('/auth/acl/only-role-user');
      const body = response.json();

      expect(response.statusCode).toBe(401);
      expect(body.message).toBe('Unauthorized');
    });

    it('Authorized', async () => {
      const user = await authService.register('test-12', '123456', {
        roles: [RoleEnum.User],
      });
      const { accessToken } = await authService.signJwt(user);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/acl/only-role-user',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(200);
      expect(body.message).toBe('Authorized');
    });

    it('Unauthorized', async () => {
      const user = await authService.register('test-13', '123456', {
        roles: [RoleEnum.Webmaster],
      });
      const { accessToken } = await authService.signJwt(user);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/acl/only-role-user',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = response.json();

      console.log(body);

      expect(response.statusCode).toBe(403);
      expect(body.message).toBe('Requer nível de acesso especial: user, foo');
    });
  });
});
