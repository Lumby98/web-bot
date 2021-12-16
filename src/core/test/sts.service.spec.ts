import { Test, TestingModule } from '@nestjs/testing';
import { StsService } from '../application.services/implementations/order-registration/sts/sts.service';

describe('StsService', () => {
  let service: StsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StsService],
    }).compile();

    service = module.get<StsService>(StsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
