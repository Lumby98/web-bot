import { Test, TestingModule } from '@nestjs/testing';
import { HultaforsService } from '../hultafors.service';

describe('HultaforsService', () => {
  let service: HultaforsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HultaforsService],
    }).compile();

    service = module.get<HultaforsService>(HultaforsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
