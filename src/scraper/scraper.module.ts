import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
