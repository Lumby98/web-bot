import { StsService } from '../../../application.services/implementations/order-registration/sts/sts.service';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { stsOrderStub } from '../../stubs/sts-order.stub';
import { PuppeteerServiceInterface } from '../../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import { PuppeteerUtilityInterface } from '../../../domain.services/puppeteer-utility.interface';
import { STSInterface } from '../../../application.services/interfaces/order-registration/sts/STS.interface';
import { orderStub } from '../../stubs/order-stub';
jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/puppeteer.service.ts',
);
describe('StsService', () => {
  let stsService: STSInterface;
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;

  beforeEach(() => {
    puppeteerUtil = new PuppeteerUtility();
    puppeteerService = new PuppeteerService(puppeteerUtil);
    stsService = new StsService(puppeteerUtil, puppeteerService);
    jest.clearAllMocks();
  });

  it('puppeteerUtil should be defined', () => {
    expect(puppeteerUtil).toBeDefined();
  });

  it('puppeteerService should be defined', () => {
    expect(puppeteerService).toBeDefined();
  });

  it('stsService should be defined', () => {
    expect(stsService).toBeDefined();
  });

  describe('handleSTSOrder', () => {
    describe('when given a valid order number', () => {
      const orderNumber = 'dfxdvcxv';
      let result;
      const order = orderStub();
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'readOrder').mockResolvedValueOnce(order);
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(stsOrderStub());
      });

      it('should call read order with the given order number', () => {
        expect(puppeteerUtil.readOrder).toBeCalledWith(orderNumber);
      });

      it('should call read sts order with the order from read order', () => {
        expect(puppeteerUtil.readSTSOrder).toBeCalledWith(order);
      });
    });

    describe('when given an empty order number', () => {
      const orderNumber = '';

      it('should throw a missing order reg error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('missing order-registration number');
      });
    });

    describe('when given a valid order number but cant find order reg page', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });

      it('should throw a could not find order reg error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('Could not find order-registration page');
      });
    });

    describe('when given a valid order number but cant get order', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'readOrder').mockResolvedValueOnce(undefined);
      });

      it('should throw a could not find order reg info', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting order-registration information');
      });
    });

    describe('when given a valid order number but cant get sts order', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(undefined);
      });

      it('should throw a could not find sts order reg info', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting sts order-registration information');
      });
    });

    describe('when given a valid order number but the sts order toeCap is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.toeCap = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting the toe cap error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting toe cap');
      });
    });

    describe('when given a valid order number but the sts order toeCap is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.toeCap = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting the toe cap error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting toe cap');
      });
    });

    describe('when given a valid order number but the sts order order number is wrong', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.orderNr = 'awdawd';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting correct order-reg error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting correct order-registration');
      });
    });

    describe('when given a valid order number but the sts order sole is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.sole = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting the sole error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting sole');
      });
    });

    describe('when given a valid order number but the sts order sole is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.sole = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting the sole error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting sole');
      });
    });

    describe('when given a valid order number but the sts order widths are undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.widthL = undefined;
        stsOrder.widthR = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a widths are empty error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow(
          'Both widths are empty. Please amend the order entry on the site',
        );
      });
    });

    describe('when given a valid order number but the sts order width right is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthR = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthR = stsOrder.widthL;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order width right is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthR = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthR = stsOrder.widthL;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order width left is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthL = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthL = stsOrder.widthR;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order width left is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthL = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthL = stsOrder.widthR;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order sizes are undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.sizeL = undefined;
        stsOrder.sizeR = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a widths are empty error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow(
          'Both sizes are empty. Please amend the order entry on the site',
        );
      });
    });

    describe('when given a valid order number but the sts order size right is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.sizeR = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthR = stsOrder.widthL;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order size right is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthR = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthR = stsOrder.widthL;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order size left is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthL = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthL = stsOrder.widthR;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order size left is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.widthL = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.widthL = stsOrder.widthR;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('inputStsModel', () => {
    describe('when given valid input', () => {
      beforeEach(async () => {
        await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10');
      });

      it('should run with no errors and call check location for is supplement loaded', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#order_info_14',
          false,
          true,
        );
      });
    });

    describe('Should call puppeteerService.tryAgain if isSupplementLoaded is false', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);

        await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10');
      });

      it('should call tryAgain', async () => {
        expect(puppeteerService.tryAgain).toBeCalledWith(
          '#order_info_14',
          '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
          0,
        );
      });
    });

    describe('When is model loaded is false', () => {
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });

      it('should throw a failed to load model page error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10'),
        ).rejects.toThrow('failed to load model page');
      });
    });

    describe('When is models is undefined', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getTextsForAll')
          .mockResolvedValueOnce(undefined);
      });

      it('should throw a could not find models error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10'),
        ).rejects.toThrow('could not find models');
      });
    });

    describe('when no model matches the found models', () => {
      it('should throw a Could not find matching model for error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('wrongModel', '45', 'Neskrid 66-10'),
        ).rejects.toThrow('Could not find matching model for: wrongModel');
      });
    });

    describe('When model check is false', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('should throw a cannot locate model select button error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10'),
        ).rejects.toThrow('Cannot locate model select button');
      });
    });

    describe('When size selector loaded is false', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('should throw a page failed to load shoe size selector error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10'),
        ).rejects.toThrow('Page failed to load shoe size selector');
      });
    });

    describe('When the width is invalid', () => {
      it('should throw a invalid width error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('mockText1', '45', 'Neskrid 66'),
        ).rejects.toThrow('invalid width');
      });
    });

    describe('When width selector loaded is false', () => {
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('should throw a page failed to load shoe width selector error', async () => {
        await expect(
          async () =>
            await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10'),
        ).rejects.toThrow('Page failed to load shoe width selector');
      });
    });
  });

  describe('inputStsUsageEnvironment', () => {
    describe('When given valid input', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        await stsService.inputStsUsageEnvironment(orderNumber);
      });

      it('should call check location on isModelLoaded', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#page-content-wrapper > div > div > div > div.col-md-7 > div',
          false,
          false,
        );
      });

      it('should call puppeterutil input twice', async () => {
        expect(puppeteerUtil.input).toBeCalledTimes(2);
      });
    });

    describe('When end user is loaded is false', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });

      it('should throw a could not load end user input error', async () => {
        await expect(
          async () => await stsService.inputStsUsageEnvironment(orderNumber),
        ).rejects.toThrow('Could not load end user input');
      });
    });

    describe('When the first input fails', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce('12311');
        await stsService.inputStsUsageEnvironment(orderNumber);
      });

      it('should call puppeterutil input thrice', async () => {
        expect(puppeteerUtil.input).toBeCalledTimes(3);
      });

      it('should call puppeterutil input with the right input', async () => {
        expect(puppeteerUtil.input).toBeCalledWith(
          '#order_enduser',
          orderNumber,
        );
      });
    });

    describe('When both attempts at inputing the end user fail', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'getInputValue')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);
      });

      it('should throw a failed to input orderNr to end user input error', async () => {
        await expect(
          async () => await stsService.inputStsUsageEnvironment(orderNumber),
        ).rejects.toThrow('Failed to input orderNr to end user input');
      });
    });

    describe('When proffesionalSectorDropdownIsLoaded is false', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('should throw a could not load professional sector dropdown error', async () => {
        await expect(
          async () => await stsService.inputStsUsageEnvironment(orderNumber),
        ).rejects.toThrow('Could not load professional sector dropdown');
      });
    });

    describe('When isModelLoaded is false', () => {
      const orderNumber = 'dfxdvcxv';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
        await stsService.inputStsUsageEnvironment(orderNumber);
      });

      it('should call pupperUtil click twice', async () => {
        expect(puppeteerUtil.click).toBeCalledTimes(2);
      });

      it('should call pupperUtil click with the right selector', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
          true,
          true,
        );
      });
    });
  });

  describe('supplement', () => {
    describe('When given valid and input insole is true, dev is true', () => {
      const insole = true;
      const dev = true;
      beforeEach(async () => {
        await stsService.supplement(insole, dev);
      });

      it('should call puppeteer util click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith('#choice_224', false, true);
      });

      it('should call puppeterutil click only twice', async () => {
        expect(puppeteerUtil.click).toBeCalledTimes(2);
      });
    });

    describe('When given valid input and insole is false, dev is true', () => {
      const insole = false;
      const dev = true;
      beforeEach(async () => {
        await stsService.supplement(insole, dev);
      });

      it('should not call puppeteer util click', async () => {
        expect(puppeteerUtil.click).toBeCalledTimes(0);
      });

      it('should not call puppeteer util wait', async () => {
        expect(puppeteerUtil.wait).toBeCalledTimes(0);
      });
    });

    describe('When given valid input and insole is false, dev is false', () => {
      const insole = false;
      const dev = false;
      beforeEach(async () => {
        await stsService.supplement(insole, dev);
      });

      it('should  call puppeteer util click one time', async () => {
        expect(puppeteerUtil.click).toBeCalledTimes(1);
      });

      it('should not call puppeteer util wait', async () => {
        expect(puppeteerUtil.wait).toBeCalledTimes(0);
      });

      it('should call puppeteer util click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#wizard_button_save',
          true,
          true,
        );
      });
    });

    describe('When given valid input and insole is true, dev is false', () => {
      const insole = true;
      const dev = false;
      beforeEach(async () => {
        await stsService.supplement(insole, dev);
      });

      it('should call puppeteer util click three times', async () => {
        expect(puppeteerUtil.click).toBeCalledTimes(3);
      });

      it('should call puppeteer util wait once', async () => {
        expect(puppeteerUtil.wait).toBeCalledTimes(1);
      });

      it('should call puppeteer util click with the right arguments', async () => {
        expect(puppeteerUtil.click).toBeCalledWith(
          '#wizard_button_save',
          true,
          true,
        );
      });
    });

    describe('When isSupplementlLoaded is false', () => {
      const insole = true;
      const dev = true;
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });

      it('should throw a could not get to supplement page error', async () => {
        await expect(
          async () => await stsService.supplement(insole, dev),
        ).rejects.toThrow('Could not get to supplement page');
      });
    });

    describe('When isModalLoaded is false', () => {
      const insole = true;
      const dev = true;
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      });

      it('should throw a could not get to orthotic/inlay modal error', async () => {
        await expect(
          async () => await stsService.supplement(insole, dev),
        ).rejects.toThrow('Could not get to orthotic/inlay modal');
      });
    });
  });
});
