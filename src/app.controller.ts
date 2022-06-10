import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs-toolkit/auth/decorators';

@Public()
@Controller()
export class AppController {
  @Get()
  getHello(): any {
    return { message: 'Hello World!' };
  }
}
