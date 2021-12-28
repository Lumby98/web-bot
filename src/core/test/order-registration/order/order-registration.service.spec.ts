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
} from '../../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { OrderTypeEnum } from '../../../enums/type.enum';
import { TargetAndSelectorStub } from '../../stubs/target-and-selector';
import { OrderRegistrationInterface } from '../../../application.services/interfaces/order-registration/order/order-registration.interface';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/puppeteer.service.ts',
);

describe('OrderRegistrationService', () => {
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;
  let orderRegistrationService: OrderRegistrationInterface;
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
    expect(orderRegistrationService).toBeDefined();
  });

  it('should be defined', () => {
    expect(puppeteerUtil).toBeDefined();
  });

  it('should be defined', () => {
    expect(puppeteerService).toBeDefined();
  });

  describe('handleOrtowearNavigation', () => {
    const validUsername = 'test@gmail.dk';
    const validPassword = 'test$Password99';
    describe('when handleOrtowearNavigation is called with a valid username and password', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getCurrentURL')
          .mockReturnValueOnce('https://beta.ortowear.com/my_page');

        /*jest.spyOn(puppeteerService, 'goToURL').mockResolvedValue(undefined);*/

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
        expect(puppeteerService.goToURL).toBeCalledWith(
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
        }).rejects.toThrow(
          'Failed to login, but ortowear didnt display errorhttps://beta.ortowear.com/my_page ',
        );
      });
    });
  });

  describe('getOrderType', () => {
    describe('when called with valid order-registration number', () => {
      const type = 'STS';
      let expected;
      beforeEach(async () => {
        expected = await orderRegistrationService.getOrderType(type);
      });

      it('should return STS', () => {
        expect(expected).toEqual(OrderTypeEnum.STS);
      });
    });

    describe('when invalid type is returned', () => {
      const invalidType = 'SOS';
      beforeEach(async () => {
        const targetAndSelector = TargetAndSelectorStub();
        targetAndSelector.type = 'MTF';
        jest
          .spyOn(puppeteerUtil, 'getTableTargetandSelector')
          .mockResolvedValueOnce(targetAndSelector);
      });
      it('should throw error if types does not match enum', () => {
        expect(
          async () => await orderRegistrationService.getOrderType(invalidType),
        ).rejects.toThrow(
          'invalid order-registration type ' +
            'Order type was ' +
            invalidType +
            ' This program supports STS and INS-S orders only.',
        );
      });

      it('should throw error if type is No matching records found', () => {
        expect(
          async () =>
            await orderRegistrationService.getOrderType(
              'No matching records found',
            ),
        ).rejects.toThrow('could not find order-registration');
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

    describe('when insole contains Emma', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce('EMMA');
      });

      it("should throw error if it's an emma insole", () => {
        expect(
          async () => await orderRegistrationService.checkForInsole(),
        ).rejects.toThrow(
          'invalid order-registration, EMMA order-registration is not supported',
        );
      });
    });
  });

  describe('InputOrderInformation', () => {});
});
