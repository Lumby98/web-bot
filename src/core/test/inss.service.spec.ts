import { Test, TestingModule } from '@nestjs/testing';
import { InssService } from '../application.services/implementations/order-registration/inss/inss.service';

describe('InssService', () => {
  let service: InssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InssService],
    }).compile();

    service = module.get<InssService>(InssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
