import { Module } from '@nestjs/common';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../infrastructure/entities/product.entity';
import { ScrapeGateway } from '../gateway/scrapeGateway';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ScraperController],
  providers: [NeskridScraperService, ScrapeGateway],
})
export class ScraperModule {}
