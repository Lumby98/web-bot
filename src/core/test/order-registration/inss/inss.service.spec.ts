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
      it('should throw a could not find selector for order in table error. selector = blank string ( "" )', () => {
        expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', ''),
        ).rejects.toThrow('could not find selector for order in table');
      });

      it('should throw a could not find selector for order in table error. selector = null', () => {
        expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', null),
        ).rejects.toThrow('could not find selector for order in table');
      });

      it('should throw a could not find selector for order in table error.  selector= undefined', () => {
        expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', undefined),
        ).rejects.toThrow('could not find selector for order in table');
      });
    });

    describe('When both sizes are empty', () => {
      beforeAll(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.sizeL = '';
        inssOrderStub.sizeR = '';
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw an append order on the site error', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow(
          'Both sizes are empty. Please amend the order entry on the site',
        );
      });
    });

    describe('When both sizes are null', () => {
      beforeAll(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.sizeL = null;
        inssOrderStub.sizeR = null;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw an append order on the site error', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow(
          'Both sizes are empty. Please amend the order entry on the site',
        );
      });
    });

    describe('When both sizes are undefined', () => {
      beforeAll(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.sizeL = undefined;
        inssOrderStub.sizeR = undefined;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw an append order on the site error', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow(
          'Both sizes are empty. Please amend the order entry on the site',
        );
      });
    });

    describe('when there is only one size in it', () => {
      let result;
      beforeEach(async () => {
        result = await inssService.handleINSSOrder('dfxdvcxv', 'null');
      });
      describe('When one size is empty', () => {
        beforeAll(() => {
          const inssOrderStub = insOrderStub();
          inssOrderStub.sizeL = '45';
          inssOrderStub.sizeR = '';
          jest
            .spyOn(puppeteerUtil, 'readINSSOrder')
            .mockResolvedValue(inssOrderStub);
        });
        it('should make both sizes the same, and not throw errors', () => {
          const expectedInsOrderStub = insOrderStub();
          expectedInsOrderStub.sizeL = '45';
          expectedInsOrderStub.sizeR = '45';
          expect(result).toEqual(expectedInsOrderStub);
        });
      });

      describe('When one size is null', () => {
        beforeAll(() => {
          const inssOrderStub = insOrderStub();
          inssOrderStub.sizeL = '45';
          inssOrderStub.sizeR = null;
          jest
            .spyOn(puppeteerUtil, 'readINSSOrder')
            .mockResolvedValue(inssOrderStub);
        });
        it('should make both sizes the same, and not throw errors', () => {
          const expectedInsOrderStub = insOrderStub();
          expectedInsOrderStub.sizeL = '45';
          expectedInsOrderStub.sizeR = '45';
          expect(result).toEqual(expectedInsOrderStub);
        });
      });

      describe('When one size is undefined', () => {
        beforeAll(() => {
          const inssOrderStub = insOrderStub();
          inssOrderStub.sizeL = '45';
          inssOrderStub.sizeR = undefined;
          jest
            .spyOn(puppeteerUtil, 'readINSSOrder')
            .mockResolvedValue(inssOrderStub);
        });
        it('should make both sizes the same, and not throw errors', () => {
          const expectedInsOrderStub = insOrderStub();
          expectedInsOrderStub.sizeL = '45';
          expectedInsOrderStub.sizeR = '45';
          expect(result).toEqual(expectedInsOrderStub);
        });
      });
    });

    describe('When model is empty', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.model = '';
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting model exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting model');
      });
    });

    describe('When model is null', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.model = null;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting model exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting model');
      });
    });

    describe('When model is undefined', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.model = undefined;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting model exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting model');
      });
    });

    describe('When address is empty', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.deliveryAddress = [''];
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting delivery address exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting delivery address');
      });
    });

    describe('When address is null', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.deliveryAddress = null;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting delivery address exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting delivery address');
      });
    });

    describe('When address is undefined', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.deliveryAddress = undefined;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting delivery address exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting delivery address');
      });
    });

    describe('When address is less than 3 characters long', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.deliveryAddress = ['12'];
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting delivery address exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting delivery address');
      });
    });

    describe('When customer is undefined', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.customerName = undefined;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting customer exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting customer');
      });
    });

    describe('When customer is null', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.customerName = null;
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting customer exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting customer');
      });
    });

    describe('When customer is empty', () => {
      beforeEach(() => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.customerName = '';
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
      });
      it('should throw a failed getting customer exception', async () => {
        await expect(
          async () => await inssService.handleINSSOrder('dfxdvcxv', 'null'),
        ).rejects.toThrow('failed getting customer');
      });
    });

    describe('When delivery address includes norway', () => {
      let result;
      beforeEach(async () => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.deliveryAddress = ['', '', 'Norway'];
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
        result = await inssService.handleINSSOrder('dfxdvcxv', 'null');
      });
      it('should set eu to false', async () => {
        expect(result.EU).toEqual(false);
      });
    });

    describe('When delivery address does not include norway', () => {
      let result;
      beforeEach(async () => {
        const inssOrderStub = insOrderStub();
        inssOrderStub.deliveryAddress = ['', '', 'Poland'];
        jest
          .spyOn(puppeteerUtil, 'readINSSOrder')
          .mockResolvedValue(inssOrderStub);
        result = await inssService.handleINSSOrder('dfxdvcxv', 'null');
      });
      it('should set eu to true', async () => {
        expect(result.EU).toEqual(true);
      });
    });
  });

  describe('handle input inss model', () => {
    describe('when given a valid inss model', () => {
      const orderNumber = 'dfxdvcxv';
      const model = 'Jalas 7100 Evo';
      beforeEach(async () => {
        await inssService.inputInssModel(insOrderStub());
      });

      it('should call searchable select with the model', () => {
        expect(puppeteerUtil.searchableSelect).toBeCalledWith(model);
      });

      it('should call read inss order with the order from read order', () => {
        expect(puppeteerUtil.selectInputContainerByArticleName).toBeCalledWith(
          'Jalas 7100 Evo',
          '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > div.form > form > div:nth-child(3)',
          'value',
        );
      });
    });

    describe('When trying to load dropdown, and it has not loaded', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });
      it('should throw cannot load dropdown error', async () => {
        await expect(
          async () => await inssService.inputInssModel(insOrderStub()),
        ).rejects.toThrow('Cannot load dropdown!');
      });
    });

    describe('When cant find cover safety panel', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false);
      });
      it('should throw Cannot find cover safety selector! error', async () => {
        await expect(
          async () => await inssService.inputInssModel(insOrderStub()),
        ).rejects.toThrow('Cannot find cover safety selector!');
      });
    });

    describe('When orthotics is not loaded', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);

        await inssService.inputInssModel(insOrderStub());
      });
      it('should call tryAgain()', () => {
        expect(puppeteerService.tryAgain).toBeCalledWith(
          '#order_opt_107',
          '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
          0,
        );
      });
    });
  });

  describe('inputInssUsageEnvironment', () => {
    describe('When all external methods return proper values', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce(insOrderStub().customerName)
          .mockResolvedValueOnce(insOrderStub().customerName)
          .mockResolvedValueOnce(insOrderStub().orderNr)
          .mockResolvedValueOnce(insOrderStub().orderNr);

        await inssService.inputInssUsageEnvironment(insOrderStub());
      });
      it('Should call input 4 times', () => {
        expect(puppeteerUtil.input).toHaveBeenCalledTimes(2);
      });
    });

    describe('When Registration no. medical specialist input does not load', () => {
      beforeEach(() => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });
      it('Should throw could not load Registration no. medical specialist input error', async () => {
        await expect(
          async () =>
            await inssService.inputInssUsageEnvironment(insOrderStub()),
        ).rejects.toThrow(
          'Could not load Registration no. medical specialist input',
        );
      });
    });

    describe('When unable to input registration no.', () => {
      beforeEach(() => {
        jest.spyOn(puppeteerUtil, 'getInputValue').mockResolvedValue('');
      });
      it('Should throw could not load Registration no. medical specialist input error', async () => {
        await expect(
          async () =>
            await inssService.inputInssUsageEnvironment(insOrderStub()),
        ).rejects.toThrow(
          'Failed to input Registration no. medical specialist input',
        );
      });
    });

    describe('If end user input does not load', () => {
      beforeEach(() => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValue(insOrderStub().customerName);

        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('Should throw could not load Registration no. medical specialist input error', async () => {
        await expect(
          async () =>
            await inssService.inputInssUsageEnvironment(insOrderStub()),
        ).rejects.toThrow('Could not load end user input');
      });
    });

    describe('When input orderNr to end user fails ', () => {
      beforeEach(() => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce(insOrderStub().customerName)
          .mockResolvedValueOnce(insOrderStub().customerName)
          .mockResolvedValueOnce('')
          .mockResolvedValueOnce('');
      });
      it('Should throw Failed to input orderNr to end user input error', async () => {
        await expect(
          async () =>
            await inssService.inputInssUsageEnvironment(insOrderStub()),
        ).rejects.toThrow('Failed to input orderNr to end user input');
      });
    });
  });

  describe('orthotics', () => {
    describe('When orthotics page dosent get loaded ', () => {
      beforeEach(() => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });

      it('Should throw Could not get to supplement page error', async () => {
        await expect(async () => await inssService.orthotics()).rejects.toThrow(
          'Could not get to supplement page',
        );
      });
    });
  });
});
