import { Module } from '@nestjs/common';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { ScrapeGateway } from '../gateway/scrapeGateway';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../infrastructure/entities/size.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NeskridProduct, HultaforsProduct, Size])],
  controllers: [ScraperController],
  providers: [NeskridScraperService, ScrapeGateway, HultaforsScraperService],
})
export class ScraperModule {}
