import { Module } from '@nestjs/common';
import { NeskridScraperService } from '../../core/application.services/implementations/scraper/neskrid-scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { ScrapeGateway } from '../gateway/scrape.gateway';
import { HultaforsScraperService } from '../../core/application.services/implementations/scraper/hultafors-scraper.service';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../infrastructure/entities/size.entity';
import { HultaforsService } from '../../core/application.services/implementations/data-collection/hultafors.service';
import { SiteService } from '../../core/application.services/implementations/data-collection/site.service';
import { Site } from '../../infrastructure/entities/site.entity';
import { NeskridService } from '../../core/application.services/implementations/data-collection/neskrid.service';
import { neskridInterfaceProvider } from '../../core/application.services/interfaces/data-collection/neskrid.interface';
import { neskridScraperInterfaceProvider } from '../../core/application.services/interfaces/scraper/neskrid-scraper.interface';
import { hultaforsScraperInterfaceProvider } from '../../core/application.services/interfaces/scraper/hultafors-scraper.interface';
import { hultaforsInterfaceProvider } from '../../core/application.services/interfaces/data-collection/hultafors.interface';
import { siteInterfaceProvider } from '../../core/application.services/interfaces/data-collection/site.interface';
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
