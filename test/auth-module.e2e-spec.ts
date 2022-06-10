import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  AUTH_USER_STORE,
  AuthService,
  ToolkitAuthModule,
} from '@nestjs-toolkit/auth';
import { IUserStore, User } from '@nestjs-toolkit/auth/user';

const mockStore: Partial<IUserStore> = {
  findByUsername: jest.fn().mockResolvedValue({ id: 'fake' }),
};

describe('AuthModule (e2e)', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ToolkitAuthModule.forRoot({
          jwtSecret: 'jwt-secret2',
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

  describe('AuthService', () => {
    it('Defined', async () => {
      expect(authService).toBeDefined();
    });

    it('FindUsername', async () => {
      const user = await authService.findByUsername('bilu');
      expect(user.id).toBe('fake');

      expect(mockStore.findByUsername).toHaveBeenCalledWith('bilu');
    });
  });
});
