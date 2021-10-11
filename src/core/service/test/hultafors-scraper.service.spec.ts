import { Test, TestingModule } from '@nestjs/testing';
import { HultaforsScraperService } from '../hultafors-scraper.service';

describe('HultaforsServiceService', () => {
  let service: HultaforsScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HultaforsScraperService],
    }).compile();

    service = module.get<HultaforsScraperService>(HultaforsScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
