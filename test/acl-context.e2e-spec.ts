import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  AclService,
  AUTH_USER_STORE,
  ToolkitAuthModule,
} from '@nestjs-toolkit/auth';
import { Test, TestingModule } from '@nestjs/testing';
import { AclContext } from '@nestjs-toolkit/auth/acl/acl.context';
import { PermissionEnum, RoleEnum } from '../src/auth/enum';

describe('AclContext', () => {
  let app: NestFastifyApplication;
  let aclService: AclService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ToolkitAuthModule.forRoot({
          jwtSecret: 'secret',
        }),
      ],
      providers: [
        {
          provide: AUTH_USER_STORE,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    await app.init();

    aclService = app.get(AclService);

    aclService.addRole(RoleEnum.Webmaster, [
      PermissionEnum.UserWrite,
      PermissionEnum.UserRead,
    ]);
  });

  it('Add Role', () => {
    const ctx = new AclContext([RoleEnum.Webmaster], []);

    expect(ctx.hasRole(RoleEnum.Webmaster)).toBeTruthy();
    expect(ctx.hasRole(RoleEnum.User)).toBeFalsy();

    expect(ctx.everyRole(RoleEnum.Webmaster)).toBeTruthy();
    expect(ctx.everyRole(RoleEnum.Webmaster, RoleEnum.User)).toBeFalsy();
  });

  it('Add Permission', () => {
    const ctx1 = new AclContext([], [PermissionEnum.UserRead]);

    const ctx2 = new AclContext(
      [],
      [PermissionEnum.UserRead, PermissionEnum.UserWrite],
    );

    expect(ctx1.hasPermission(PermissionEnum.UserRead)).toBeTruthy();
    expect(ctx1.hasPermission(PermissionEnum.UserWrite)).toBeFalsy();

    expect(
      ctx1.everyPermission(PermissionEnum.UserRead, PermissionEnum.UserWrite),
    ).toBeFalsy();

    expect(
      ctx2.everyPermission(PermissionEnum.UserRead, PermissionEnum.UserWrite),
    ).toBeTruthy();
  });

  it('MakeContext', () => {
    const ctx1 = aclService.makeContext([RoleEnum.Webmaster]);

    expect(ctx1.hasPermission(PermissionEnum.UserRead)).toBeTruthy();
    expect(ctx1.hasPermission(PermissionEnum.UserWrite)).toBeTruthy();
    expect(ctx1.hasPermission(PermissionEnum.PostRead)).toBeFalsy();

    // simulate get cached
    aclService.makeContext([RoleEnum.Webmaster]);
  });

  it('MakeContext invalid args', () => {
    const ctx1 = aclService.makeContext(null);
    expect(ctx1.getPermissions()).toHaveLength(0);
  });

  it('Validate role Webmaster', () => {
    const ctx = aclService.makeContext([RoleEnum.Webmaster]);

    expect(
      ctx.everyPermission(PermissionEnum.UserRead, PermissionEnum.UserWrite),
    ).toBeTruthy();
  });

  it('Get data', () => {
    const data = aclService.getData();

    expect(data).toHaveLength(1);
    expect(data[0].role).toBe(RoleEnum.Webmaster);
    expect(data[0].permissions).toHaveLength(2);
  });

  it('Get Permissions', () => {
    const perms = aclService.getPermissions();
    expect(perms).toEqual([PermissionEnum.UserRead, PermissionEnum.UserWrite]);
  });

  it('Get Roles', () => {
    const perms = aclService.getRoles();
    expect(perms).toEqual([RoleEnum.Webmaster]);
  });
});
