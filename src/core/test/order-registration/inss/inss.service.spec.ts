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
import { func, when } from '@hapi/joi';
import { once } from 'cluster';

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
    describe('when handle inss order gets called with invalid order number', async () => {
      it('should throw a missing order registration error', () => {
        expect(
          async () => await inssService.handleINSSOrder(''),
        ).rejects.toThrow('missing order-registration number'); //expect the unexpected, or the spanish inquisition, either or.
      });
    });
  });
});
