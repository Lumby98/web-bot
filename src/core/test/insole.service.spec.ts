import { Test, TestingModule } from '@nestjs/testing';
import { InsoleService } from '../service/insole.service';

describe('InsoleService', () => {
  let service: InsoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsoleService],
    }).compile();

    service = module.get<InsoleService>(InsoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
