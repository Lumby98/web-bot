import { Test, TestingModule } from '@nestjs/testing';
import { NeskridScraperService } from '../service/neskrid-scraper.service';
import {
  NeskridScraperInterface,
  neskridScraperInterfaceProvider,
} from '../interfaces/neskrid-scraper.interface';
import { neskridInterfaceProvider } from '../interfaces/neskrid.interface';
import { NeskridService } from '../service/neskrid.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';

describe('ScraperService', () => {
  let service: NeskridScraperInterface;
  const mockConnection = () => ({
    createQueryRunner: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeskridScraperService,
        { provide: neskridInterfaceProvider, useClass: NeskridService },
        {
          provide: getRepositoryToken(NeskridProduct),
          useClass: Repository,
        },
        {
          provide: Connection,
          useFactory: mockConnection,
        },
      ],
    }).compile();

    service = module.get<NeskridScraperInterface>(NeskridScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
