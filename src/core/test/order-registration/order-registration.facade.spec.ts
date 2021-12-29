import { OrderRegistrationFacade } from '../../facades/implementations/order-registration.facade';
import { PuppeteerUtilityInterface } from '../../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../../infrastructure/api/puppeteer.utility';
import { ConfigService } from '@nestjs/config';
import { PuppeteerService } from '../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { PuppeteerServiceInterface } from '../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import { OrderRegistrationInterface } from '../../application.services/interfaces/order-registration/order/order-registration.interface';
import { STSInterface } from '../../application.services/interfaces/order-registration/sts/STS.interface';
import { INSSInterface } from '../../application.services/interfaces/order-registration/ins-s/INSS.interface';
import { OrderRegistrationService } from '../../application.services/implementations/order-registration/order/order-registration.service';
import { StsService } from '../../application.services/implementations/order-registration/sts/sts.service';
import { InssService } from '../../application.services/implementations/order-registration/inss/inss.service';
import { loginDtoStub } from '../stubs/login-dto.stub';
import { orderListStub } from '../stubs/order-list.stub';

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
  let orderRegistrationFacade: OrderRegistrationFacade;
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;
  let orderRegistrationService: OrderRegistrationInterface;
  let stsService: STSInterface;
  let inssService: INSSInterface;
  let configService: ConfigService;
  beforeEach(async () => {
    configService = new ConfigService<Record<string, unknown>>();
    puppeteerUtil = new PuppeteerUtility();
    puppeteerService = new PuppeteerService(puppeteerUtil);
    orderRegistrationService = new OrderRegistrationService(
      puppeteerUtil,
      puppeteerService,
      configService,
    );
    stsService = new StsService(puppeteerUtil, puppeteerService);
    inssService = new InssService(puppeteerUtil, puppeteerService);
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

  it('orderRegistrationFacade should be defined', () => {
    expect(orderRegistrationFacade).toBeDefined();
  });

  it('configService should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('inssService should be defined', () => {
    expect(inssService).toBeDefined();
  });

  it('stsService should be defined', () => {
    expect(stsService).toBeDefined();
  });

  it('puppeteerService should be defined', () => {
    expect(puppeteerService).toBeDefined();
  });

  it('orderRegistrationService should be defined', () => {
    expect(orderRegistrationService).toBeDefined();
  });

  it('puppeteerUtil should be defined', () => {
    expect(puppeteerUtil).toBeDefined();
  });

  describe('getOrderInfo', () => {
    describe('when given a valid order number and login', () => {
      const orderNumber = 'randomOrderNumberForTest';
      let result;

      beforeEach(async () => {
        result = await orderRegistrationFacade.getOrderInfo(
          orderNumber,
          loginDtoStub(),
        );
      });

      it('should return a valid order list', () => {
        const OrderListStub = orderListStub();
        expect(result).toEqual(OrderListStub);
      });
    });
  });

});


