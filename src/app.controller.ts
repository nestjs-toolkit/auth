import { Controller, Get } from '@nestjs/common';
import { AuthPublic } from '@nestjs-toolkit/auth/decorators';

@AuthPublic()
@Controller()
export class AppController {
  @Get()
  getHello(): any {
    return { message: 'Hello World!' };
  }
}
