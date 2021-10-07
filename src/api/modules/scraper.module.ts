import { Module } from '@nestjs/common';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { ScrapeGateway } from '../gateway/scrapeGateway';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../infrastructure/entities/size.entity';
import { HultaforsService } from '../../core/service/hultafors.service';
import { SiteService } from '../../core/service/site.service';
import { Site } from '../../infrastructure/entities/site.entity';
import { NeskridService } from "../../core/service/neskrid.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([NeskridProduct, HultaforsProduct, Size, Site]),
  ],
  controllers: [ScraperController],
  providers: [
    NeskridScraperService,
    NeskridService,
    ScrapeGateway,
    HultaforsScraperService,
    HultaforsService,
    SiteService,
  ],
})
export class ScraperModule {}
