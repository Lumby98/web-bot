import { Test, TestingModule } from '@nestjs/testing';
import { InssService } from '../../../application.services/implementations/order-registration/inss/inss.service';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../domain.services/puppeteer-utility.interface';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { insOrderStub } from '../../stubs/ins-s-order.stub';
import { orderStub } from '../../stubs/order-stub';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/puppeteer.service.ts',
);

describe('InssService', () => {
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;
  let inssService: InssService;
  beforeEach(async () => {
    puppeteerUtil = new PuppeteerUtility();
    puppeteerService = new PuppeteerService(puppeteerUtil);
    inssService = new InssService(puppeteerUtil, puppeteerService);
    jest.clearAllMocks();
  });

  it('puppeteerUtil should be defined', () => {
    expect(puppeteerUtil).toBeDefined();
  });

  it('puppeteerService should be defined', () => {
    expect(puppeteerService).toBeDefined();
  });

  it('inssService should be defined', () => {
    expect(inssService).toBeDefined();
  });

  describe('Confirmation', () => {
    describe('DropdownCorrectValue', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce('1')
          .mockResolvedValueOnce('Standard');
        await inssService.confirmation();
      });

      it('it should not call the dropdownSelect method', async () => {
        expect(puppeteerUtil.dropdownSelect).not.toHaveBeenCalled();
      });
    });

    describe('DropdownIncorrectValue', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce('77')
          .mockResolvedValueOnce('Standart');
        await inssService.confirmation();
      });

      it('it should be called twice', async () => {
        expect(puppeteerUtil.dropdownSelect).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('HandleInssOrder', () => {
    describe('When given at valid order number and selector', () => {
      const orderNumber = 'dfxdvcxv';
      let result;
      beforeEach(async () => {
        result = await inssService.handleINSSOrder(orderNumber, 'Selector');
      });

      it('should return a valid ins order model', () => {
        expect(result).toEqual(insOrderStub());
      });

      it('should call read order with the given order number', () => {
        expect(puppeteerUtil.readOrder).toBeCalledWith(orderNumber);
      });

      it('should call read inss order with the order from read order', () => {
        expect(puppeteerUtil.readINSSOrder).toBeCalledWith(orderStub());
      });
    });

    describe('When handle inss order gets called with invalid order number', () => {
      it('should throw a failed getting correct order-registration error. input= empty string ', () => {
        expect(
          async () => await inssService.handleINSSOrder('', 'Selector'),
        ).rejects.toThrow('failed getting correct order-registration'); //expect the unexpected, or the spanish inquisition, either or.
      });

      it('should throw a failed getting correct order-registration error. input= null', () => {
        expect(
          async () => await inssService.handleINSSOrder(null, 'Selector'),
        ).rejects.toThrow('failed getting correct order-registration'); //expect the unexpected, or the spanish inquisition, either or.
      });

      it('should throw a failed getting correct order-registration error. input= undefined', () => {
        expect(
          async () => await inssService.handleINSSOrder(undefined, 'Selector'),
        ).rejects.toThrow('failed getting correct order-registration'); //expect the unexpected, or the spanish inquisition, either or.
      });
    });

    describe('When handle inss order gets called with invalid selector', () => {
      it('should throw a could not find selector for order in table error', () => {
        expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', ''),
        ).rejects.toThrow('could not find selector for order in table');
      });

      it('should throw a could not find selector for order in table error', () => {
        expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', null),
        ).rejects.toThrow('could not find selector for order in table');
      });
    });
  });
});
