import { Test, TestingModule } from '@nestjs/testing';
import { NeskridService } from '../neskrid.service';

describe('NeskridService', () => {
  let service: NeskridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeskridService],
    }).compile();

    service = module.get<NeskridService>(NeskridService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
