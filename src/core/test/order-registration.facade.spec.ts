import { Test, TestingModule } from '@nestjs/testing';
import { OrderRegistrationFacade } from '../facades/implementations/order-registration.facade';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Repository } from 'typeorm';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../infrastructure/api/puppeteer.utility';
import { OrderTypeEnum } from '../enums/type.enum';
import { stsOrderStub } from './stubs/sts-order.stub';
import { TargetAndSelectorStub } from './stubs/target-and-selector';
import { ConfigModule, ConfigService } from '@nestjs/config';

jest.mock('src/infrastructure/api/order-puppeteer.application.services.ts');

describe('OrderRegistrationService', () => {
  let orderRegistrationFacade: OrderRegistrationFacade;
  let puppeteerUtil: PuppeteerUtilityInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRegistrationFacade,
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

    orderRegistrationFacade = module.get<OrderRegistrationFacade>(
      OrderRegistrationFacade,
    );
    puppeteerUtil = module.get<PuppeteerUtility>(
      PuppeteerUtility,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderRegistrationFacade).toBeDefined();
  });

  describe('startPuppeteer', () => {
    const validURL = 'https://www.google.com/';

    describe('when startPuppeteer is called with a valid url', () => {
      beforeEach(async () => {
        await orderRegistrationFacade.startPuppeteer(validURL);
      });

      it('should call the order-registration-puppeteer.application.services start method with the right arguments', async () => {
        expect(puppeteerUtil.start).toBeCalledWith(false, validURL);
      });
    });

    describe('when startPuppeteer is called with an empty string', () => {
      const emptyURL = '';

      it('should throw an error with the right message', async () => {
        await expect(
          async () => await orderRegistrationFacade.startPuppeteer(emptyURL),
        ).rejects.toThrow('Invalid url, the given url is empty');
      });
    });

    describe('when startPuppeteer is called with an invalid url', () => {
      const invalidURL = 'www.yahoo.com';

      it('should throw an error with the right message', async () => {
        await expect(
          async () => await orderRegistrationFacade.startPuppeteer(invalidURL),
        ).rejects.toThrow('Invalid url, the given url is invalid');
      });
    });
  });

  describe('stopPuppeteer', () => {
    describe('when stopPuppeteer is called', () => {
      beforeEach(async () => {
        await orderRegistrationFacade.stopPuppeteer();
      });

      it('should call the order-registration-puppeteer.application.services stop method', async () => {
        expect(puppeteerUtil.stop).toBeCalled();
      });
    });
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

        await orderRegistrationFacade.handleOrtowearNavigation(
          validUsername,
          validPassword,
        );
      });

      it('should call order-registration-puppeter.application.services loginOrtowear method with the right arguments', async () => {
        expect(puppeteerUtil.loginOrtowear).toBeCalledWith(
          validUsername,
          validPassword,
        );
      });
    });

    describe('when handleOrtowearNavigation is called with an empty username', () => {
      const emptyUsername = '';

      it('should throw an error with the right message', async () => {
        await expect(
          async () =>
            await orderRegistrationFacade.handleOrtowearNavigation(
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
            await orderRegistrationFacade.handleOrtowearNavigation(
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
            await orderRegistrationFacade.handleOrtowearNavigation(
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
            await orderRegistrationFacade.handleOrtowearNavigation(
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
          await orderRegistrationFacade.handleOrtowearNavigation(
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
        expected = await orderRegistrationFacade.getOrderType(
          validOrderNumber,
        );
      });

      it('should return STS', () => {
        expect(expected).toEqual(OrderTypeEnum.STS);
      });

      it('should call readType', () => {
        expect(puppeteerUtil.getTableTargetandSelector).toBeCalledTimes(
          1,
        );
      });
    });

    describe('when called with invalid order-registration number', () => {
      it('should throw error if order-registration number is blank', () => {
        expect(async () =>
          orderRegistrationFacade.getOrderType(''),
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
            await orderRegistrationFacade.getOrderType(validOrderNumber),
        ).rejects.toThrow('invalid order-registration type');
      });
    });
  });

  describe('checkForInsole', () => {
    describe('when there is an insole', () => {
      let expected;
      beforeEach(async () => {
        expected = await orderRegistrationFacade.checkForInsole();
      });

      it('should return true', () => {
        expect(expected).toEqual(true);
      });
    });
    describe('when there is no insole', () => {
      let expected;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(false);
        expected = await orderRegistrationFacade.checkForInsole();
      });

      it('should return false', () => {
        expect(expected).toEqual(false);
      });
    });
  });

  describe('handleSTSOrder', () => {
    describe('when a sts order-registration is returned', () => {
      const orderNumber = 'dfxdvcxv';
      let expected;
      beforeEach(async () => {
        expected = await orderRegistrationFacade.handleSTSOrder(orderNumber);
      });
      it('should return an STS order-registration', () => {
        expect(expected).toEqual(stsOrderStub());
      });
    });
  });
});
