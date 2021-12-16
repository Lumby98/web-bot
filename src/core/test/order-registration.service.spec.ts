import { Test, TestingModule } from '@nestjs/testing';
import { OrderRegistrationService } from '../application.services/implementations/order-registration/order/order-registration.service';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../infrastructure/api/puppeteer.utility';
import { ConfigService } from '@nestjs/config';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('OrderRegistrationService', () => {
  let service: OrderRegistrationService;
  let puppeteerUtil: PuppeteerUtilityInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRegistrationService,
        PuppeteerUtility,
        {
          provide: puppeteerUtilityInterfaceProvider,
          useClass: PuppeteerUtility,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // this is being super extra, in the case that you need multiple keys with the `get` method
              if (key === 'ORTOWEARURL') {
                return 'https://beta.ortowear.com/';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OrderRegistrationService>(OrderRegistrationService);

    puppeteerUtil = module.get<PuppeteerUtility>(PuppeteerUtility);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
