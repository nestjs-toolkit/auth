import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  AUTH_USER_STORE,
  AuthConfig,
  AuthService,
  ToolkitAuthModule,
} from '@nestjs-toolkit/auth';
import { IUserStore } from '@nestjs-toolkit/auth/user';
import { DEMO_CONF_TOKEN, ConfigModule, ConfigService } from '../src/config';

const mockStore: Partial<IUserStore> = {
  findByUsername: jest.fn().mockResolvedValue({ id: 'fake' }),
};

describe('AuthModule (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;

  describe('ForRoot', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ToolkitAuthModule.forRoot({
            jwtSecret: 'jwt-secret-1475',
            saltPassword: '$2b$10$E1rzRMj1XcEFTlCfdk0XCO',
          }),
        ],
        providers: [
          {
            provide: AUTH_USER_STORE,
            useValue: mockStore,
          },
        ],
      }).compile();

      app = moduleFixture.createNestApplication(new FastifyAdapter());

      await app.init();

      authService = app.get(AuthService);
    });

    afterAll(async () => {
      await app.close();
    });

    it('Defined', async () => {
      expect(authService).toBeDefined();
    });

    it('FindUsername', async () => {
      const user = await authService.findByUsername('bilu');
      expect(user.id).toBe('fake');

      expect(mockStore.findByUsername).toHaveBeenCalledWith('bilu');
    });

    it('Get Config', async () => {
      const audience = await authService.getConfig().jwtSecret;
      expect(audience).toBe('jwt-secret-1475');
    });
  });

  describe('ForRootAsync::useFactory', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ToolkitAuthModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (conf): AuthConfig => ({
              jwtSecret: 'jwt-secret-factory',
              saltPassword: 'salt-factory',
              jwtSignOptions: {
                audience: conf.audience,
              },
            }),
            inject: [DEMO_CONF_TOKEN],
          }),
        ],
        providers: [
          {
            provide: AUTH_USER_STORE,
            useValue: mockStore,
          },
        ],
      }).compile();

      app = moduleFixture.createNestApplication(new FastifyAdapter());

      await app.init();

      authService = app.get(AuthService);
    });

    afterAll(async () => {
      await app.close();
    });

    it('Defined', async () => {
      expect(authService).toBeDefined();
    });

    it('Get Config', async () => {
      const audience = await authService.getConfig().jwtSignOptions.audience;
      expect(audience).toBe('fake-audience');
    });
  });

  describe('ForRootAsync::useClass', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ToolkitAuthModule.forRootAsync({
            imports: [ConfigModule],
            useClass: ConfigService,
          }),
        ],
        providers: [
          {
            provide: AUTH_USER_STORE,
            useValue: mockStore,
          },
        ],
      }).compile();

      app = moduleFixture.createNestApplication(new FastifyAdapter());

      await app.init();

      authService = app.get(AuthService);
    });

    afterAll(async () => {
      await app.close();
    });

    it('Defined', async () => {
      expect(authService).toBeDefined();
    });

    it('Get Config', async () => {
      const audience = await authService.getConfig().jwtSignOptions.audience;
      expect(audience).toBe('fake-audience-123');
    });
  });

  describe('ForRootAsync::useExisting', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ToolkitAuthModule.forRootAsync({
            imports: [ConfigModule],
            useExisting: ConfigService,
          }),
        ],
        providers: [
          {
            provide: AUTH_USER_STORE,
            useValue: mockStore,
          },
        ],
      }).compile();

      app = moduleFixture.createNestApplication(new FastifyAdapter());

      await app.init();

      authService = app.get(AuthService);
    });

    afterAll(async () => {
      await app.close();
    });

    it('Defined', async () => {
      expect(authService).toBeDefined();
    });

    it('Get Config', async () => {
      const audience = await authService.getConfig().jwtSignOptions.audience;
      expect(audience).toBe('fake-audience-123');
    });
  });
});
