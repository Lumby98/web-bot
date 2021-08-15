import { Module } from '@nestjs/common';
import { AppController } from './api/controllers/app.controller';
import { ScraperService } from './core/services/scraper/scraper.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [ScraperService],
})
export class AppModule {}
