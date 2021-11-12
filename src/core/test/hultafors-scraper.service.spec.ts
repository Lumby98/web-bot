import { Test, TestingModule } from '@nestjs/testing';
import { HultaforsScraperService } from '../service/hultafors-scraper.service';
import { hultaforsScraperInterfaceProvider } from '../interfaces/hultafors-scraper.interface';
import { hultaforsInterfaceProvider } from '../interfaces/hultafors.interface';
import { HultaforsService } from '../service/hultafors.service';
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
