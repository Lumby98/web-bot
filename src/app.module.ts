import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database.module';
import { ScraperModule } from './api/modules/scraper.module';
import { UserModule } from './api/modules/user.module';
import * as Joi from '@hapi/joi';
import { AuthenticationModule } from './api/modules/authentication.module';
import { HultaforsService } from './core/service/hultafors.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    ScraperModule,
    UserModule,
    AuthenticationModule,
  ],
  controllers: [],
  providers: [HultaforsService],
})
export class AppModule {}
