import { SetMetadata } from '@nestjs/common';

// export const META_AUTH_GUEST = 'toolkit_auth_guest';
export const META_AUTH_PUBLIC = 'toolkit_auth_public';
export const META_ACL_ROLES = 'toolkit_auth_acl_roles';
export const META_ACL_PERMS = 'toolkit_auth_acl_perms';

// Informa ao AuthGuard que a request e publica, mais caso for enviado um JWT deve ser validado e add User Context
// export const AuthGuest = () => SetMetadata(META_AUTH_GUEST, true);

// Defini uma rota como PUBLICA, ou seja nao ira precisar informar token e caso informado ira ignorar a validacao do token
export const Public = () => SetMetadata(META_AUTH_PUBLIC, true);

export const AuthAclRoles = (...roles: string[]) =>
  SetMetadata(META_ACL_ROLES, roles);

export const AuthAclPerms = (...perms: string[]) =>
  SetMetadata(META_ACL_PERMS, perms);
