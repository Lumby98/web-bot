import { Module } from '@nestjs/common';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { ScrapeGateway } from '../gateway/scrape.gateway';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../infrastructure/entities/size.entity';
import { HultaforsService } from '../../core/service/hultafors.service';
import { SiteService } from '../../core/service/site.service';
import { Site } from '../../infrastructure/entities/site.entity';
import { NeskridService } from '../../core/service/neskrid.service';
import { neskridInterfaceProvider } from '../../core/interfaces/neskrid.interface';
import { neskridScraperInterfaceProvider } from '../../core/interfaces/neskrid-scraper.interface';
import { hultaforsScraperInterfaceProvider } from '../../core/interfaces/hultafors-scraper.interface';
import { hultaforsInterfaceProvider } from '../../core/interfaces/hultafors.interface';
import { siteInterfaceProvider } from '../../core/interfaces/site.interface';
import { Puppeteer } from 'puppeteer';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NeskridProduct, HultaforsProduct, Size, Site]),
    AuthenticationModule,
  ],
  controllers: [ScraperController],
  providers: [
    {
      provide: neskridScraperInterfaceProvider,
      useClass: NeskridScraperService,
    },
    { provide: neskridInterfaceProvider, useClass: NeskridService },
    ScrapeGateway,
    {
      provide: hultaforsScraperInterfaceProvider,
      useClass: HultaforsScraperService,
    },
    { provide: hultaforsInterfaceProvider, useClass: HultaforsService },
    { provide: siteInterfaceProvider, useClass: SiteService },
  ],
})
export class ScraperModule {}
