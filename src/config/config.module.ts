import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { DEMO_CONF_TOKEN } from './constants';

@Module({
  providers: [
    ConfigService,
    {
      provide: DEMO_CONF_TOKEN,
      useValue: {
        audience: 'fake-audience',
      },
    },
  ],
  exports: [ConfigService, DEMO_CONF_TOKEN],
})
export class ConfigModule {}
