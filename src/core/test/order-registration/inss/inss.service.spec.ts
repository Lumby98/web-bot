import { Test, TestingModule } from '@nestjs/testing';
import { InssService } from '../../../application.services/implementations/order-registration/inss/inss.service';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../domain.services/puppeteer-utility.interface';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../../application.services/interfaces/puppeteer/puppeteerServiceInterface';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/webbot.service.ts',
);

describe('InssService', () => {
  let inssService: InssService;
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InssService,
        {
          provide: puppeteerUtilityInterfaceProvider,
          useClass: PuppeteerUtility,
        },
        {
          provide: puppeteerServiceInterfaceProvider,
          useClass: PuppeteerService,
        },
      ],
    }).compile();

    puppeteerUtil = module.get<PuppeteerUtilityInterface>(PuppeteerUtility);

    puppeteerService = module.get<PuppeteerServiceInterface>(PuppeteerService);
    jest.clearAllMocks();

    inssService = module.get<InssService>(InssService);
  });

  it('should be defined', () => {
    expect(inssService).toBeDefined();
  });
});
