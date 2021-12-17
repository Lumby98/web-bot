import { Test, TestingModule } from '@nestjs/testing';
import { OrderRegistrationService } from '../../../application.services/implementations/order-registration/order/order-registration.service';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { ConfigService } from '@nestjs/config';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../../application.services/interfaces/puppeteer/puppeteerServiceInterface';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { OrderTypeEnum } from '../../../enums/type.enum';
import { TargetAndSelectorStub } from '../../stubs/target-and-selector';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('OrderRegistrationService', () => {

  const mockwebbotService = {
    goToURL: jest.fn().mockResolvedValue(undefined),
  };
  let orderRegistrationService: OrderRegistrationService;
  let puppeteerUtil: PuppeteerUtilityInterface;
  let webbotService: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRegistrationService,
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
    })
      .overrideProvider({
        provide: puppeteerServiceInterfaceProvider,
        useClass: PuppeteerService,
      })
      .useValue(mockwebbotService)
      .compile();

    orderRegistrationService = module.get<OrderRegistrationService>(
      OrderRegistrationService,
    );

    puppeteerUtil = module.get<PuppeteerUtility>(PuppeteerUtility);

    webbotService = module.get<PuppeteerService>(PuppeteerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderRegistrationService).toBeDefined();
  });

  it('should be defined', () => {
    expect(puppeteerUtil).toBeDefined();
  });

  it('should be defined', () => {
    expect(webbotService).toBeDefined();
  });

  describe('handleOrtowearNavigation', () => {
    const validUsername = 'test@gmail.dk';
    const validPassword = 'test$Password99';
    describe('when handleOrtowearNavigation is called with a valid username and password', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getCurrentURL')
          .mockReturnValueOnce('https://beta.ortowear.com/')
          .mockReturnValueOnce('https://beta.ortowear.com/my_page');

        jest.spyOn(webbotService, 'goToURL').mockResolvedValue(undefined);

        await orderRegistrationService.handleOrtowearNavigation(
          validUsername,
          validPassword,
        );
      });

      it('should call the puppeteer utility loginOrtowear method with the right arguments', async () => {
        expect(puppeteerUtil.loginOrtowear).toBeCalledWith(
          validUsername,
          validPassword,
        );
      });

      it('should call the webbot service goToURL method with the right arguments', async () => {
        jest.mock(
          'src/core/application.services/implementations/order-registration/webbot.service.ts',
        );
        expect(webbotService.goToURL).toBeCalledWith(
          'https://beta.ortowear.com/',
        );
      });
    });

    describe('when handleOrtowearNavigation is called with an empty username', () => {
      const emptyUsername = '';

      it('should throw an error with the right message', async () => {
        await expect(
          async () =>
            await orderRegistrationService.handleOrtowearNavigation(
              emptyUsername,
              validPassword,
            ),
        ).rejects.toThrow('Wrong username or password');
      });
    });

    describe('when handleOrtowearNavigation is called with an empty password', () => {
      const emptyPassword = '';

      it('should throw an error with the right message', () => {
        expect(
          async () =>
            await orderRegistrationService.handleOrtowearNavigation(
              validUsername,
              emptyPassword,
            ),
        ).rejects.toThrow('Wrong username or password');
      });
    });

    describe('when handleOrtowearNavigation is called with an invalid username', () => {
      const invalidUsername = 'joe@123aspx.com';

      it('should throw an error with the right message', () => {
        expect(
          async () =>
            await orderRegistrationService.handleOrtowearNavigation(
              invalidUsername,
              validPassword,
            ),
        ).rejects.toThrow('Wrong username or password');
      });
    });

    describe('when handleOrtowearNavigation is called and puppeteer fails login', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getCurrentURL')
          .mockReturnValueOnce('https://beta.ortowear.com/')
          .mockReturnValueOnce('https://beta.ortowear.com/my_page');

        jest
          .spyOn(puppeteerUtil, 'loginOrtowear')
          .mockImplementationOnce(() => {
            throw new Error(
              'Failed to login, wrong username or password (Ortowear)',
            );
          });
      });

      it('should throw an error with the right message when username and password is correct, but something else happened', () => {
        expect(
          async () =>
            await orderRegistrationService.handleOrtowearNavigation(
              validUsername,
              validPassword,
            ),
        ).rejects.toThrow(
          'Failed to login, wrong username or password (Ortowear)',
        );
      });
    });

    describe('when site is down', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getCurrentURL')
          .mockReturnValueOnce('')
          .mockReturnValueOnce('');
      });

      it('should throw error if site could not be reached', () => {
        expect(async () => {
          await orderRegistrationService.handleOrtowearNavigation(
            validUsername,
            validPassword,
          );
        }).rejects.toThrow('Navigation failed: went to the wrong URL');
      });
    });
  });

  describe('getOrderType', () => {
    describe('when called with valid order-registration number', () => {
      const validOrderNumber = '155d215-1';
      let expected;
      beforeEach(async () => {
        expected = await orderRegistrationService.getOrderType(
          validOrderNumber,
        );
      });

      it('should return STS', () => {
        expect(expected).toEqual(OrderTypeEnum.STS);
      });

      it('should call readType', () => {
        expect(puppeteerUtil.getTableTargetandSelector).toBeCalledTimes(1);
      });
    });

    describe('when called with invalid order-registration number', () => {
      it('should throw error if order-registration number is blank', () => {
        expect(async () =>
          orderRegistrationService.getOrderType(''),
        ).rejects.toThrow('order-registration number is blank');
      });
    });

    describe('when invalid type is returned', () => {
      const validOrderNumber = '156dt64-1';
      beforeEach(async () => {
        const targetAndSelector = TargetAndSelectorStub();
        targetAndSelector.type = 'MTF';
        jest
          .spyOn(puppeteerUtil, 'getTableTargetandSelector')
          .mockResolvedValueOnce(targetAndSelector);
      });
      it('should throw error if types does not match enum', () => {
        expect(
          async () =>
            await orderRegistrationService.getOrderType(validOrderNumber),
        ).rejects.toThrow('invalid order-registration type');
      });
    });
  });

  describe('checkForInsole', () => {
    describe('when there is an insole', () => {
      let expected;
      beforeEach(async () => {
        expected = await orderRegistrationService.checkForInsole();
      });

      it('should return true', () => {
        expect(expected).toEqual(true);
      });
    });
    describe('when there is no insole', () => {
      let expected;
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
        expected = await orderRegistrationService.checkForInsole();
      });

      it('should return false', () => {
        expect(expected).toEqual(false);
      });
    });
  });
});
