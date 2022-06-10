import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AclManageService } from './acl-manage.service';

@Module({
  controllers: [AuthController],
  providers: [AclManageService],
})
export class AuthModule {}
