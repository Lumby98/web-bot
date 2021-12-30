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

      it('should call getCurrentUrl once', () => {
        expect(puppeteerUtil.getCurrentURL).toBeCalledTimes(1);
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

    describe('when site is down', () => {
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

  describe('InputOrderInformation', () => {
    describe('when called with valid input and insole and EU are true', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const insole = true;
      const EU = true;
      const customerName = 'Ortowear';
      beforeEach(async () => {
        await orderRegistrationService.inputOrderInformation(
          orderNumber,
          deliveryAddress,
          insole,
          EU,
          customerName,
        );
      });

      it('should run with no errors and call check location isInUsageEnvoPage', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#order_enduser',
          false,
          false,
        );
      });

      it('should call input twice', () => {
        expect(puppeteerUtil.input).toBeCalledTimes(2);
      });

      it('should call click twice', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(2);
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_ordernr',
          orderNumber,
        );
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_afladr_search',
          'RODOTEKA',
        );
      });
    });

    describe('when called with valid input and insole is true and EU is false', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const insole = true;
      const EU = false;
      const customerName = 'Ortowear';
      beforeEach(async () => {
        await orderRegistrationService.inputOrderInformation(
          orderNumber,
          deliveryAddress,
          insole,
          EU,
          customerName,
        );
      });

      it('should run with no errors and call check location isInUsageEnvoPage', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#order_enduser',
          false,
          false,
        );
      });

      it('should call input twice', () => {
        expect(puppeteerUtil.input).toBeCalledTimes(2);
      });

      it('should call click twice', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(2);
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_ordernr',
          orderNumber,
        );
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_afladr_search',
          'RODOTEKA',
        );
      });
    });

    describe('when called with valid input and insole is false and EU is true', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const insole = false;
      const EU = true;
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'inputAddress')
          .mockResolvedValueOnce(undefined);
        await orderRegistrationService.inputOrderInformation(
          orderNumber,
          deliveryAddress,
          insole,
          EU,
          customerName,
        );
      });

      it('should run with no errors and call check location isInUsageEnvoPage', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#order_enduser',
          false,
          false,
        );
      });

      it('should call input twice', () => {
        expect(puppeteerUtil.input).toBeCalledTimes(2);
      });

      it('should call click twice', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(2);
      });

      it('should call inputaddres once', () => {
        expect(orderRegistrationService.inputAddress).toBeCalledTimes(1);
      });

      it('should call inputaddres with the right arguments', () => {
        expect(orderRegistrationService.inputAddress).toBeCalledWith(
          deliveryAddress,
          orderNumber,
          customerName,
        );
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_ordernr',
          orderNumber,
        );
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_afladr_search',
          'Ortowear',
        );
      });
    });

    describe('when called with valid input and insole is false and EU is false', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const insole = false;
      const EU = false;
      const customerName = 'Ortowear';
      beforeEach(async () => {
        await orderRegistrationService.inputOrderInformation(
          orderNumber,
          deliveryAddress,
          insole,
          EU,
          customerName,
        );
      });

      it('should run with no errors and call check location isInUsageEnvoPage', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#order_enduser',
          false,
          false,
        );
      });

      it('should call input twice', () => {
        expect(puppeteerUtil.input).toBeCalledTimes(2);
      });

      it('should call click twice', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(2);
      });

      it('should call input with the the right arguments', () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_ordernr',
          orderNumber,
        );
      });
    });
  });

  describe('AdjustMonth', () => {
    describe('when called with valid arguments and the months are the same right away', () => {
      const newDate = new Date();
      newDate.setMonth(11);
      const timeOfdelivery = newDate;
      const ortowearMonth = 'December';
      const counter = 0;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'getMonthFromString')
          .mockReturnValueOnce(12);
        result = await orderRegistrationService.adjustMonth(
          timeOfdelivery,
          ortowearMonth,
          counter,
        );
      });
      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when called with valid arguments and the months are not the same and 11 months apart', () => {
      const newDate = new Date();
      newDate.setMonth(11);
      const timeOfdelivery = newDate;
      const ortowearMonth = 'January';
      const counter = 0;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'getMonthFromString')
          .mockReturnValueOnce(1)
          .mockReturnValueOnce(2)
          .mockReturnValueOnce(3)
          .mockReturnValueOnce(4)
          .mockReturnValueOnce(5)
          .mockReturnValueOnce(6)
          .mockReturnValueOnce(7)
          .mockReturnValueOnce(8)
          .mockReturnValueOnce(9)
          .mockReturnValueOnce(10)
          .mockReturnValueOnce(11)
          .mockReturnValueOnce(12);
        result = await orderRegistrationService.adjustMonth(
          timeOfdelivery,
          ortowearMonth,
          counter,
        );
      });
      it('should return true', () => {
        expect(result).toEqual(true);
      });

      it('should call puppeteerUtil click 11 times ', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(11);
      });

      it('should call puppeteerUtil click with the right arguments ', () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all',
          true,
          true,
        );
      });

      it('should call puppeteerService getElementText 11 times ', () => {
        expect(puppeteerService.getElementText).toBeCalledTimes(11);
      });

      it('should call puppeteerService getElementText with the right arguments ', () => {
        expect(puppeteerService.getElementText).toBeCalledWith(
          '#ui-datepicker-div > div > div > span.ui-datepicker-month',
        );
      });
    });

    describe('when the time of delivery date is past', () => {
      const newDate = new Date();
      newDate.setMonth(0);
      const timeOfdelivery = newDate;
      const ortowearMonth = 'December';
      const counter = 0;
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'getMonthFromString')
          .mockReturnValueOnce(12);
      });
      it('should throw a cannot set delivery date in the past error', () => {
        expect(
          async () =>
            await orderRegistrationService.adjustMonth(
              timeOfdelivery,
              ortowearMonth,
              counter,
            ),
        ).rejects.toThrow('Cannot set delivery date in the past');
      });
    });
  });

  describe('AdjustYear', () => {
    describe('when called with valid arguments and the years are the same right away', () => {
      const orderYear = 2021;
      const ortowearYear = 2021;
      const counter = 0;
      let result;
      beforeEach(async () => {
        result = await orderRegistrationService.adjustYear(
          orderYear,
          ortowearYear,
          counter,
        );
      });
      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when called with valid arguments and the years are not the same and 99 years ahead', () => {
      const orderYear = 2120;
      const ortowearYear = 2021;
      const counter = 0;
      let result;
      beforeEach(async () => {
        for (let i = 0; i <= 99; i++) {
          const year = 2021 + i;
          jest
            .spyOn(puppeteerService, 'getElementText')
            .mockResolvedValueOnce(year.toString());
        }

        result = await orderRegistrationService.adjustYear(
          orderYear,
          ortowearYear,
          counter,
        );
      });
      it('should return true', () => {
        expect(result).toEqual(true);
      });

      it('should call puppeteerUtil click 99 times ', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(100);
      });

      it('should call puppeteerUtil click with the right arguments ', () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all',
          true,
          true,
        );
      });

      it('should call puppeteerService getElementText 11 times ', () => {
        expect(puppeteerService.getElementText).toBeCalledTimes(100);
      });

      it('should call puppeteerService getElementText with the right arguments ', () => {
        expect(puppeteerService.getElementText).toBeCalledWith(
          '#ui-datepicker-div > div > div > span.ui-datepicker-year',
        );
      });
    });

    describe('when called with an invalid year in the past', () => {
      const orderYear = 2020;
      const ortowearYear = 2021;
      const counter = 0;
      let result;
      it('should throw a cannot set delivery date in the past error', () => {
        expect(
          async () =>
            await orderRegistrationService.adjustYear(
              orderYear,
              ortowearYear,
              counter,
            ),
        ).rejects.toThrow('Cannot set delivery date in the past');
      });
    });
  });

  describe('formatDeliveryDate', () => {
    describe('when given valid date string', () => {
      const date = '10/12/2022';
      let result;
      beforeEach(() => {
        result = orderRegistrationService.formatDeliveryDate(date);
      });

      it('should should return formatted date', () => {
        expect(result).toEqual(new Date(2022, 9, 12));
      });
    });

    describe('when given invalid date format', () => {
      const date = '10-12-2020';
      it('should throw invalid date string error', () => {
        expect(() => {
          orderRegistrationService.formatDeliveryDate(date);
        }).toThrow('failed to format date: Invalid date string');
      });
    });

    describe('when wrong date information is given', () => {
      it('should throw invalid date string error', () => {
        expect(() => {
          orderRegistrationService.formatDeliveryDate('november/12/2020');
        }).toThrow('failed to format date: date should be numbers');
      });
      it('should throw invalid date string error', () => {
        expect(() => {
          orderRegistrationService.formatDeliveryDate('11/eleven/2020');
        }).toThrow('failed to format date: date should be numbers');
      });
      it('should throw invalid date string error', () => {
        expect(() => {
          orderRegistrationService.formatDeliveryDate(
            'november/12/twnty twnty',
          );
        }).toThrow('failed to format date: date should be numbers');
      });
    });
  });

  describe('getMonthFromString', () => {
    describe('when given valid month string', () => {
      const month = 'may';
      let result;
      beforeEach(() => {
        result = orderRegistrationService.getMonthFromString(month);
      });

      it('should should return formatted date', () => {
        expect(result).toEqual(5);
      });
    });

    describe('when given invalid month sting', () => {
      const month = 'fish';
      it('should throw invalid date string error', () => {
        expect(() => {
          orderRegistrationService.getMonthFromString(month);
        }).toThrow(`Failed to get month from string, input was this: ${month}`);
      });
    });
  });

  describe('getNextDayOfWeek', () => {
    describe('when given valid day of week', () => {
      const date = new Date(2022, 4, 2);
      const dayOfWeek = 1;
      const newDate = new Date(2022, 4, 9);
      let result;
      beforeEach(() => {
        result = orderRegistrationService.getNextDayOfWeek(date, dayOfWeek);
      });
      it('should return valid a valid date', () => {
        expect(result).toEqual(newDate);
      });
    });

    describe('when given invalid day of week', () => {
      it('should throw invalid day of week error', () => {
        expect(() => {
          orderRegistrationService.getNextDayOfWeek(new Date(), 7);
        }).toThrow(
          'Invalid day of the week: the day of the week should be from 0-6',
        );
      });
    });
  });

  describe('handleNeskridNavigation', () => {
    describe('when given valid arguments', () => {
      const validUsername = 'username@username.com';
      const validPassword = 'password';
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'loginValidation')
          .mockReturnValueOnce(true);
        jest
          .spyOn(puppeteerUtil, 'getCurrentURL')
          .mockReturnValueOnce(
            'https://www.neskrid.com/plugins/neskrid/myneskrid_main.aspx',
          );
        await orderRegistrationService.handleNeskridNavigation(
          validUsername,
          validPassword,
        );
      });

      it('should call get current url', () => {
        expect(puppeteerUtil.getCurrentURL).toHaveBeenCalledTimes(1);
      });
    });

    describe('when login validation returns false', () => {
      const username = 'username@username';
      const password = 'password';
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'loginValidation')
          .mockReturnValueOnce(false);
      });

      it('should throw invalid login error', () => {
        expect(async () => {
          await orderRegistrationService.handleNeskridNavigation(
            username,
            password,
          );
        }).rejects.toThrow('Wrong username or password');
      });
    });

    describe('when navigation fails', () => {
      const username = 'username@username.com';
      const password = 'password';
      beforeEach(async () => {
        jest
          .spyOn(orderRegistrationService, 'loginValidation')
          .mockReturnValueOnce(true);
      });

      it('should throw invalid login error', () => {
        expect(async () => {
          await orderRegistrationService.handleNeskridNavigation(
            username,
            password,
          );
        }).rejects.toThrow('Failed to login to Neskrid');
      });
    });
  });

  describe('inputAddress', () => {
    describe('when called with valid input', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('Borgervaenget')
          .mockResolvedValueOnce('5')
          .mockResolvedValueOnce('2100')
          .mockResolvedValueOnce('Koebenhavn');

        await orderRegistrationService.inputAddress(
          deliveryAddress,
          orderNumber,
          customerName,
        );
      });

      it('should call input five times', () => {
        expect(puppeteerUtil.input).toBeCalledTimes(5);
      });

      it('should not call getInputValue four times', () => {
        expect(puppeteerUtil.getInputValue).toBeCalledTimes(4);
      });

      it('should not call checklocation', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(0);
      });

      it('should call dropdownSelect with the right arguments', () => {
        expect(puppeteerUtil.dropdownSelect).toBeCalledWith(
          '#order_afladr_country',
          'Denmark',
        );
      });
    });

    describe('when the delivery address is to short', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = ['Borgervaenget 5', '2100 Koebenhavn'];
      const customerName = 'Ortowear';

      it('should throw an invalid date error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('invalid date');
      });
    });

    describe('when the street and nr is invalid', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';

      it('should throw a missing address information error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('missing address information');
      });
    });

    describe('when puppeteer inputs the wrong street', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('wrongRoad');
      });

      it('should throw a wrong street selected for address error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('wrong street selected for address');
      });
    });

    describe('when puppeteer inputs the wrong street number', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('Borgervaenget')
          .mockResolvedValueOnce('10');
      });

      it('should throw a wrong street number selected for address error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('wrong street number selected for address');
      });
    });

    describe('when the postal code and city is invalid', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('Borgervaenget')
          .mockResolvedValueOnce('5');
      });

      it('should throw a missing postal code or city error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('missing postal code or city');
      });
    });

    describe('when puppeteer inputs the wrong zip code', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('Borgervaenget')
          .mockResolvedValueOnce('5')
          .mockResolvedValueOnce('3456');
      });

      it('should throw a wrong zip code selected for address error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('wrong zip code selected for address');
      });
    });

    describe('when the country is missing from delivery address', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'KobenhavnDenmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('Borgervaenget')
          .mockResolvedValueOnce('5')
          .mockResolvedValueOnce('2100')
          .mockResolvedValueOnce('Koebenhavn');
      });

      it('should throw a missing country error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow('missing country');
      });
    });

    describe('when puppeteer inputs the wrong city', () => {
      const orderNumber = 'dfxdvcxv';
      const deliveryAddress = [
        'Borgervaenget 5',
        '2100 Koebenhavn',
        'Kobenhavn, Denmark',
      ];
      const customerName = 'Ortowear';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('Borgervaenget')
          .mockResolvedValueOnce('5')
          .mockResolvedValueOnce('2100')
          .mockResolvedValueOnce('wrongCity');
      });

      it('should throw a wrong city selected for address error', () => {
        expect(async () => {
          await orderRegistrationService.inputAddress(
            deliveryAddress,
            orderNumber,
            customerName,
          );
        }).rejects.toThrow(
          'wrong city selected for address: ' +
            'wrongCity' +
            ' ' +
            'Koebenhavn',
        );
      });
    });
  });

  describe('loginValidation', () => {
    describe('when called with a valid username and password', () => {
      const validUsername = 'user@hotmail.com';
      const validPassword = 'validPassword';
      let result;
      beforeEach(() => {
        result = orderRegistrationService.loginValidation(
          validUsername,
          validPassword,
        );
      });

      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when called with a missing username', () => {
      const validUsername = '';
      const validPassword = 'validPassword';
      let result;
      beforeEach(() => {
        result = orderRegistrationService.loginValidation(
          validUsername,
          validPassword,
        );
      });

      it('should return false', () => {
        expect(result).toEqual(false);
      });
    });

    describe('when called with a missing password', () => {
      const validUsername = 'user@hotmail.com';
      const validPassword = '';
      let result;
      beforeEach(() => {
        result = orderRegistrationService.loginValidation(
          validUsername,
          validPassword,
        );
      });

      it('should return false', () => {
        expect(result).toEqual(false);
      });
    });

    describe('when called with an invalid username', () => {
      const validUsername = 'invalid';
      const validPassword = 'validPassword';
      let result;
      beforeEach(() => {
        result = orderRegistrationService.loginValidation(
          validUsername,
          validPassword,
        );
      });

      it('should return false', () => {
        expect(result).toEqual(false);
      });
    });
  });

  describe('getTableInfo', () => {
    describe('when called with a valid ordernumber', () => {
      const orderNumber = '234234';
      let result;
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'getTableTargetandSelector').mockReset();

        jest
          .spyOn(puppeteerUtil, 'getTableTargetandSelector')
          .mockResolvedValueOnce(TargetAndSelectorStub());
        result = await orderRegistrationService.getTableInfo(orderNumber);
      });

      it('should return true', () => {
        expect(result).toEqual(TargetAndSelectorStub());
      });

      it('should call getTableTargetandSelector', () => {
        expect(puppeteerUtil.getTableTargetandSelector).toBeCalledTimes(1);
      });

      it('should call getTableTargetandSelector with the right orderNumber', () => {
        expect(puppeteerUtil.getTableTargetandSelector).toBeCalledWith(
          orderNumber,
        );
      });
    });
  });

  describe('handleOrderCompletion', () => {
    describe('when called with valid input and dev is true and completeOrder is false', () => {
      const dev = true;
      const completeOrder = false;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should not call input', () => {
        expect(puppeteerUtil.input).toBeCalledTimes(0);
      });

      it('should not call click', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(0);
      });

      it('should not call checklocation', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(0);
      });
    });

    describe('when called with valid input and dev is true and completeOrder is true', () => {
      const dev = true;
      const completeOrder = true;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should not call click', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(0);
      });

      it('should not call tryAgain', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(0);
      });

      it('should not call checklocation', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(0);
      });
    });

    describe('when called with valid input and dev is false and completeOrder is false', () => {
      const dev = false;
      const completeOrder = false;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(expectedDateString);
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should call click radio button with the right arguments ', () => {
        expect(puppeteerUtil.clickRadioButton).toBeCalledWith(
          '#order_cemaxnconf',
        );
      });

      it('should call click four times', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(4);
      });

      it('should call click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#choiceinvalid-footer > button.btn.btn-default',
          true,
          true,
        );
      });

      it('should not call tryAgain', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(0);
      });

      it('should call checklocation four times', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(4);
      });
    });

    describe('when called with valid input and dev is false and completeOrder is true', () => {
      const dev = false;
      const completeOrder = true;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(expectedDateString);
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should call click three times', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(3);
      });

      it('should call click radio button with the right arguments ', () => {
        expect(puppeteerUtil.clickRadioButton).toBeCalledWith(
          '#order_cemaxnconf',
        );
      });

      it('should call click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#choiceinvalid-footer > button.btn.btn-success',
          true,
          true,
        );
      });

      it('should not call tryAgain', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(0);
      });

      it('should call checklocation four times', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(4);
      });
    });

    describe('when called with valid input and dev is false and completeOrder is true and pageCheck returns false', () => {
      const dev = false;
      const completeOrder = true;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(expectedDateString);
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true);
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should call click three times', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(3);
      });

      it('should call click radio button with the right arguments ', () => {
        expect(puppeteerUtil.clickRadioButton).toBeCalledWith(
          '#order_cemaxnconf',
        );
      });

      it('should call click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#choiceinvalid-footer > button.btn.btn-success',
          true,
          true,
        );
      });

      it('should call tryAgain once', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(1);
      });

      it('should call tryAgain with the right arguments', async () => {
        expect(puppeteerService.tryAgain).toBeCalledWith(
          '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
          '#wizard_button_save',
          0,
        );
      });

      it('should call checklocation four times', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(4);
      });
    });

    describe('when called with valid input and dev is false and completeOrder is true and modal check returns false', () => {
      const dev = false;
      const completeOrder = true;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(expectedDateString);
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true);
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should call click three times', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(3);
      });

      it('should call click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#choiceinvalid-footer > button.btn.btn-success',
          true,
          true,
        );
      });

      it('should call click radio button with the right arguments ', () => {
        expect(puppeteerUtil.clickRadioButton).toBeCalledWith(
          '#order_cemaxnconf',
        );
      });

      it('should call tryAgain once', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(1);
      });

      it('should call tryAgain with the right arguments', async () => {
        expect(puppeteerService.tryAgain).toBeCalledWith(
          '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div',
          '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
          0,
        );
      });

      it('should call checklocation four times', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(4);
      });
    });

    describe('when called with valid input and dev is false and completeOrder is true and modal check returns false', () => {
      const dev = false;
      const completeOrder = true;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(expectedDateString);
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true);
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should call click radio button with the right arguments ', () => {
        expect(puppeteerUtil.clickRadioButton).toBeCalledWith(
          '#order_cemaxnconf',
        );
      });

      it('should call click three times', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(3);
      });

      it('should call click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#choiceinvalid-footer > button.btn.btn-success',
          true,
          true,
        );
      });

      it('should call tryAgain once', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(1);
      });

      it('should call tryAgain with the right arguments', async () => {
        expect(puppeteerService.tryAgain).toBeCalledWith(
          '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div',
          '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
          0,
        );
      });

      it('should call checklocation four times', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(4);
      });
    });

    describe('when called with valid input and dev is false and completeOrder is true and delivery date check returns false', () => {
      const dev = false;
      const completeOrder = true;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('should throw a failed to get deliveryDate error ', () => {
        expect(async () => {
          await orderRegistrationService.handleOrderCompletion(
            dev,
            completeOrder,
          );
        }).rejects.toThrow('failed to get deliveryDate');
      });
    });

    describe('when called with valid input and dev is false and completeOrder is true and checkbox check returns false', () => {
      const dev = false;
      const completeOrder = true;
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      const expectedDateString = `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
      let result;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(expectedDateString);
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
        result = await orderRegistrationService.handleOrderCompletion(
          dev,
          completeOrder,
        );
      });

      it('should run with no errors and return the right date string', async () => {
        expect(result).toEqual(expectedDateString);
      });

      it('should not call click radio button  ', () => {
        expect(puppeteerUtil.clickRadioButton).toBeCalledTimes(0);
      });

      it('should call click three times', () => {
        expect(puppeteerUtil.click).toBeCalledTimes(3);
      });

      it('should call click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#choiceinvalid-footer > button.btn.btn-success',
          true,
          true,
        );
      });

      it('should not call tryAgain ', () => {
        expect(puppeteerService.tryAgain).toBeCalledTimes(0);
      });

      it('should call checklocation four times', () => {
        expect(puppeteerUtil.checkLocation).toBeCalledTimes(4);
      });
    });
  });
});
