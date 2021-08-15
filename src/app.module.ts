import { Module } from '@nestjs/common';
import { AppController } from './api/controllers/app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
