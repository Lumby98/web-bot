import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database.module';
import { ScraperModule } from './ui.api/modules/scraper.module';
import { UserModule } from './ui.api/modules/user.module';
import * as Joi from '@hapi/joi';
import { AuthenticationModule } from './ui.api/modules/authentication.module';
import { InsoleModule } from './ui.api/modules/insole.module';
import { SavedLoginController } from './saved-login/saved-login.controller';

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
    InsoleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
