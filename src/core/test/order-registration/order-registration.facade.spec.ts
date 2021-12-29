import { Test, TestingModule } from '@nestjs/testing';
import { OrderRegistrationFacade } from '../../facades/implementations/order-registration.facade';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../../infrastructure/entities/hultafors.product.entity';
import { Repository } from 'typeorm';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../../infrastructure/api/puppeteer.utility';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuppeteerService } from '../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import {
  OrderRegistrationInterface,
  orderRegistrationInterfaceProvider,
} from '../../application.services/interfaces/order-registration/order/order-registration.interface';
import {
  STSInterface,
  STSInterfaceProvider,
} from '../../application.services/interfaces/order-registration/sts/STS.interface';
import {
  INSSInterface,
  iNSSInterfaceProvider,
} from '../../application.services/interfaces/order-registration/ins-s/INSS.interface';
import { OrderRegistrationService } from '../../application.services/implementations/order-registration/order/order-registration.service';
import { StsService } from '../../application.services/implementations/order-registration/sts/sts.service';
import { InssService } from '../../application.services/implementations/order-registration/inss/inss.service';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/puppeteer.service.ts',
);
jest.mock(
  'src/core/application.services/implementations/order-registration/order/order-registration.service.ts',
);
jest.mock(
  'src/core/application.services/implementations/order-registration/sts/sts.service.ts',
);
jest.mock(
  'src/core/application.services/implementations/order-registration/inss/inss.service.ts',
);

describe('OrderRegistrationService', () => {
  /*
  * @Inject(puppeteerUtilityInterfaceProvider)
    private readonly puppeteerUtil: PuppeteerUtilityInterface,
    @Inject(orderRegistrationInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationInterface,
    @Inject(puppeteerInterfaceProvider)
    private readonly puppeteerService: PuppeteerInterface,
    @Inject(STSInterfaceProvider)
    private readonly stsService: STSInterface,
    @Inject(iNSSInterfaceProvider)
    private readonly inssService: INSSInterface,
    private configService: ConfigService,*/

  let orderRegistrationFacade: OrderRegistrationFacade;
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;
  let orderRegistrationService: OrderRegistrationInterface;
  let stsService: STSInterface;
  let inssService: INSSInterface;
  let configService: ConfigService;
  beforeEach(async () => {
    /* const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRegistrationFacade,
        PuppeteerUtility,
        {
          provide: puppeteerUtilityInterfaceProvider,
          useClass: PuppeteerUtility,
        },
        PuppeteerService,
        {
          provide: puppeteerServiceInterfaceProvider,
          useClass: PuppeteerService,
        },
        OrderRegistrationService,
        {
          provide: orderRegistrationInterfaceProvider,
          useClass: OrderRegistrationService,
        },
        InssService,
        {
          provide: iNSSInterfaceProvider,
          useClass: InssService,
        },
        StsService,
        {
          provide: STSInterfaceProvider,
          useClass: StsService,
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

    orderRegistrationFacade = module.get<OrderRegistrationFacade>(
      OrderRegistrationFacade,
    );
    puppeteerUtil = module.get<PuppeteerUtilityInterface>(PuppeteerUtility);

    puppeteerService = module.get<PuppeteerServiceInterface>(PuppeteerService);

    orderRegistrationService = module.get<OrderRegistrationInterface>(
      OrderRegistrationService,
    );

    stsService = module.get<STSInterface>(StsService);

    inssService = module.get<INSSInterface>(InssService);*/
    configService = new ConfigService<Record<string, unknown>>();
    puppeteerUtil = new PuppeteerUtility();
    puppeteerService = new PuppeteerService(puppeteerUtil);
    orderRegistrationService = new OrderRegistrationService(
      puppeteerUtil,
      puppeteerService,
      configService,
    );
    orderRegistrationFacade = new OrderRegistrationFacade(
      puppeteerUtil,
      orderRegistrationService,
      puppeteerService,
      stsService,
      inssService,
      configService,
    );

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      // this is being super extra, in the case that you need multiple keys with the `get` method
      if (key === 'ORTOWEARURL') {
        return 'https://beta.ortowear.com/';
      }
      return null;
    });
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderRegistrationFacade).toBeDefined();
  });
});
