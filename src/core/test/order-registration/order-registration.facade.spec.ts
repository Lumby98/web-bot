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
import { TargetAndSelectorStub } from '../stubs/target-and-selector';
import { OrderTypeEnum } from '../../enums/type.enum';
import { ProcessStepEnum } from '../../enums/processStep.enum';

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
    describe('when given a valid order number and login, and get order type returns sts', () => {
      const orderNumber = 'randomOrderNumberForTest';
      let result;
      let OrderListStub;

      beforeEach(async () => {
        OrderListStub = orderListStub();
        result = await orderRegistrationFacade.getOrderInfo(
          orderNumber,
          loginDtoStub(),
        );
      });

      it('should return a valid order list', () => {
        OrderListStub.INSOrder = null;
        OrderListStub.STSOrder.insole = true;
        OrderListStub.logEntries[0].timestamp = result.logEntries[0].timestamp;
        expect(result).toEqual(OrderListStub);
      });

      it('should call handleOrtowearNavigation() with the given login', () => {
        expect(
          orderRegistrationService.handleOrtowearNavigation,
        ).toBeCalledWith(loginDtoStub().username, loginDtoStub().password);
      });

      it('should call handleSTSOrder', () => {
        expect(stsService.handleSTSOrder).toBeCalledWith(
          orderNumber,
          TargetAndSelectorStub().selector,
        );
      });
    });
    describe('when given a valid order number and login, and get order type returns inss', () => {
      const orderNumber = 'randomOrderNumberForTest';
      let result;

      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'getOrderType')
          .mockResolvedValue(OrderTypeEnum.INSS);

        const targetAndSelectorStub = TargetAndSelectorStub();
        targetAndSelectorStub.type = 'INSS';

        jest
          .spyOn(orderRegistrationService, 'getTableInfo')
          .mockResolvedValue(targetAndSelectorStub);

        result = await orderRegistrationFacade.getOrderInfo(
          orderNumber,
          loginDtoStub(),
        );
      });

      it('should return a valid order list', () => {
        const OrderListStub = orderListStub();
        OrderListStub.STSOrder = null;
        OrderListStub.logEntries[0].timestamp = result.logEntries[0].timestamp;
        expect(result).toEqual(OrderListStub);
      });

      it('should call handleOrtowearNavigation() with the given login', () => {
        expect(
          orderRegistrationService.handleOrtowearNavigation,
        ).toBeCalledWith(loginDtoStub().username, loginDtoStub().password);
      });

      it('should call handleINSSOrder()', () => {
        expect(inssService.handleINSSOrder).toBeCalledWith(
          orderNumber,
          TargetAndSelectorStub().selector,
        );
      });
    });

    describe('When orderNumber length is lower than 1', () => {
      const orderNumber = '';
      let result;

      beforeEach(async () => {
        result = await orderRegistrationFacade.getOrderInfo(
          orderNumber,
          loginDtoStub(),
        );
      });
      it('should throw a order-registration number is blank error', async () => {
        expect(result).toEqual({
          INSOrder: null,
          STSOrder: null,
          logEntries: [
            {
              error: { errorMessage: 'order-registration number is blank' },
              order: { completed: false, orderNr: '' },
              process: 0,
              status: false,
              timestamp: result.logEntries[0].timestamp,
            },
          ],
        });
      });
    });

    describe('When it cant get the order type', () => {
      const orderNumber = 'randomOrderNumberForTest';
      let result;

      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'getOrderType')
          .mockResolvedValue(undefined);

        result = await orderRegistrationFacade.getOrderInfo(
          orderNumber,
          loginDtoStub(),
        );
      });
      it('should throw a could not determine order-registration type error ', async () => {
        expect(result).toEqual({
          INSOrder: null,
          STSOrder: null,
          logEntries: [
            {
              error: {
                errorMessage: 'could not determine order-registration type',
              },
              order: { completed: false, orderNr: orderNumber },
              process: 0,
              status: false,
              timestamp: result.logEntries[0].timestamp,
            },
          ],
        });
      });
    });
  });

  describe('createOrder', () => {
    describe('When given valid input with an stsOrder', () => {
      let result;
      const OrderListStub = orderListStub();
      OrderListStub.INSOrder = null;
      OrderListStub.STSOrder.insole = true;
      beforeEach(async () => {
        result = await orderRegistrationFacade.createOrder(
          OrderListStub,
          loginDtoStub().username,
          loginDtoStub().password,
          true,
          false,
        );
      });

      it('should return a valid order list with an sts order', () => {
        const OrderListStub = orderListStub();
        OrderListStub.INSOrder = null;
        OrderListStub.STSOrder.insole = true;
        OrderListStub.STSOrder.timeOfDelivery = result.STSOrder.timeOfDelivery;
        OrderListStub.logEntries = [
          {
            status: true,
            process: ProcessStepEnum.GETORDERINFO,
            timestamp: result.logEntries[0].timestamp,
            order: { orderNr: 'randomOrderNumberForTest', completed: false },
          },
          {
            status: true,
            process: ProcessStepEnum.REGISTERORDER,
            timestamp: result.logEntries[1].timestamp,
            order: { orderNr: 'dfxdvcxv', completed: false },
          },
        ];
        expect(result).toEqual(OrderListStub);
      });
    });

    describe('When given valid input with an inssOrder', () => {
      let result;
      const OrderListStub = orderListStub();
      OrderListStub.STSOrder = null;
      beforeEach(async () => {
        result = await orderRegistrationFacade.createOrder(
          OrderListStub,
          loginDtoStub().username,
          loginDtoStub().password,
          true,
          false,
        );
      });

      it('should return a valid order list with an ins order', () => {
        const OrderListStub = orderListStub();
        OrderListStub.STSOrder = null;
        OrderListStub.INSOrder.timeOfDelivery = result.INSOrder.timeOfDelivery;
        OrderListStub.logEntries = [
          {
            status: true,
            process: ProcessStepEnum.GETORDERINFO,
            timestamp: result.logEntries[0].timestamp,
            order: { orderNr: 'randomOrderNumberForTest', completed: false },
          },
          {
            status: true,
            process: ProcessStepEnum.REGISTERORDER,
            timestamp: result.logEntries[1].timestamp,
            order: { orderNr: 'dfxdvcxv', completed: false },
          },
        ];
        expect(result).toEqual(OrderListStub);
      });
    });

    describe('When it cant get a deliverDate with ins', () => {
      let result;
      const OrderListStub = orderListStub();
      OrderListStub.STSOrder = null;
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'handleOrderCompletion')
          .mockResolvedValue(undefined);
        result = await orderRegistrationFacade.createOrder(
          OrderListStub,
          loginDtoStub().username,
          loginDtoStub().password,
          true,
          false,
        );
      });

      it('Should log a Failed to get delivery date! error', () => {
        const OrderListStub = orderListStub();
        OrderListStub.STSOrder = null;
        //OrderListStub.INSOrder.timeOfDelivery = result.INSOrder.timeOfDelivery;
        OrderListStub.INSOrder = null;
        OrderListStub.logEntries = [
          {
            status: true,
            process: ProcessStepEnum.GETORDERINFO,
            timestamp: result.logEntries[0].timestamp,
            order: { orderNr: 'randomOrderNumberForTest', completed: false },
          },
          {
            status: false,
            process: ProcessStepEnum.REGISTERORDER,
            timestamp: result.logEntries[1].timestamp,
            order: { orderNr: 'dfxdvcxv', completed: false },
            error: { errorMessage: 'Failed to get delivery date! undefined' },
          },
        ];
        expect(result).toEqual(OrderListStub);
      });
    });
  });
});
