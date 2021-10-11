import { Test, TestingModule } from '@nestjs/testing';
import { NeskridScraperService } from '../neskrid-scraper.service';

describe('ScraperService', () => {
  let service: NeskridScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeskridScraperService],
    }).compile();

    service = module.get<NeskridScraperService>(NeskridScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
