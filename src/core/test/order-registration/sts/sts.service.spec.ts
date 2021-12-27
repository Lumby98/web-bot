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
      beforeEach(async () => {
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(stsOrderStub());
      });

      it('should call read order with the given order number', () => {
        expect(puppeteerUtil.readOrder).toBeCalledWith(orderNumber);
      });

      it('should call read sts order with the order from read order', () => {
        expect(puppeteerUtil.readSTSOrder).toBeCalledWith(orderStub());
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

      it('should throw a sizes are empty error', async () => {
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
        expected.sizeR = stsOrder.sizeL;
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
        stsOrder.sizeR = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.sizeR = stsOrder.sizeL;
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
        stsOrder.sizeL = undefined;
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
        stsOrder.sizeL = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        expected.sizeL = stsOrder.sizeR;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a valid order number but the sts order model is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.model = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting model error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting model');
      });
    });

    describe('when given a valid order number but the sts order model is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.model = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting model error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting model');
      });
    });

    describe('when given a valid order number but the sts order delivery address is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.deliveryAddress = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting delivery address error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting delivery address');
      });
    });

    describe('when given a valid order number but the sts order delivery address is less than 3', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.deliveryAddress = ['bork,', 'mork'];
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting delivery address error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting delivery address');
      });
    });

    describe('when given a valid order number but the sts order customer name is undefined', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.customerName = undefined;
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting customer error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting customer');
      });
    });

    describe('when given a valid order number but the sts order customer name is an empty string', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      beforeEach(async () => {
        stsOrder.customerName = '';
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
      });

      it('should throw a failed getting customer error', async () => {
        await expect(
          async () => await stsService.handleSTSOrder(orderNumber, 'selector'),
        ).rejects.toThrow('failed getting customer');
      });
    });

    describe('when given a valid order number and the delivery address does not include Norway', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let expected;
      let result;
      beforeEach(async () => {
        stsOrder.deliveryAddress = [
          'Priorparken 850',
          '2605 Brøndby',
          'Kobenhavn, Denmark',
        ];
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        expected = stsOrder;
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model where EU is true', () => {
        expect(result.EU).toEqual(true);
      });
    });

    describe('when given a valid order number and the delivery address includes Norway', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let result;
      beforeEach(async () => {
        stsOrder.deliveryAddress = [
          'Priorparken 850',
          '2605 Brøndby',
          'Kobenhavn, Norway',
        ];
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model where EU is false', () => {
        expect(result.EU).toEqual(false);
      });
    });

    describe('when given a valid order number and the delivery address includes Norway test 2', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let result;
      beforeEach(async () => {
        stsOrder.deliveryAddress = [
          'Priorparken 850',
          '2605 Brøndby Norway',
          'Kobenhavn, Denmark',
        ];
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model where EU is false', () => {
        expect(result.EU).toEqual(false);
      });
    });

    describe('when given a valid order number and the delivery address includes Norway test 3', () => {
      const orderNumber = 'dfxdvcxv';
      const stsOrder = stsOrderStub();
      let result;
      beforeEach(async () => {
        stsOrder.deliveryAddress = [
          'Priorparken Norway 850',
          '2605 Brøndby',
          'Kobenhavn, Denmark',
        ];
        jest
          .spyOn(puppeteerUtil, 'readSTSOrder')
          .mockResolvedValueOnce(stsOrder);
        result = await stsService.handleSTSOrder(orderNumber, 'selector');
      });

      it('should return a valid STS order model where EU is false', () => {
        expect(result.EU).toEqual(false);
      });
    });
  });

  describe('inputStsModel', () => {
    describe('Should run with no errors', () => {
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(true);

        await stsService.inputStsModel('mockText1', '45', 'Neskrid 66-10');
      });

      it('should return an STS order-registration', async () => {
        expect(puppeteerUtil.checkLocation).toBeCalledWith(
          '#order_info_14',
          false,
          true,
        );
      });
    });

    describe('Should call puppeteerService.tryAgain if isSupplementlLoaded is false ', () => {
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
  });
});
