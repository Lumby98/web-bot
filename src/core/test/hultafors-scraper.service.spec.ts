import { Test, TestingModule } from '@nestjs/testing';
import { HultaforsScraperService } from '../application.services/implementations/scraper/hultafors-scraper.service';
import { hultaforsScraperInterfaceProvider } from '../application.services/interfaces/scraper/hultafors-scraper.interface';
import { hultaforsInterfaceProvider } from '../application.services/interfaces/data-collection/hultafors.interface';
import { HultaforsService } from '../application.services/implementations/data-collection/hultafors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { Repository } from 'typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../infrastructure/entities/size.entity';

describe('HultaforsServiceService', () => {
  let service: HultaforsScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HultaforsScraperService,
        { provide: hultaforsInterfaceProvider, useClass: HultaforsService },
        {
          provide: getRepositoryToken(HultaforsProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Size),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<HultaforsScraperService>(HultaforsScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
