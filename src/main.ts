import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
  /* const httpsOptions = {
	key: fs.readFileSync('/etc/letsencrypt/live/webbot.ortowear.com/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/webbot.ortowear.com/fullchain.pem'),
  }*/
  const app = await NestFactory.create(AppModule, {
    //httpsOptions,
  });
  const configService: ConfigService = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('ORIGIN'),
    credentials: true,
    allowedHeaders: 'Content-Type ,Authentication, Set-Cookie',
    exposedHeaders: 'Set-Cookie, Content-Type ,Authentication',
  });
  await app.listen(configService.get('PORT') || 8080);
}
bootstrap();
