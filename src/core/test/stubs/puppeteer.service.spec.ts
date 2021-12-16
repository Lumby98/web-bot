import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from '../../application.services/implementations/order-registration/puppeteer/puppeteer.service';

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuppeteerService],
    }).compile();

    service = module.get<PuppeteerService>(PuppeteerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
