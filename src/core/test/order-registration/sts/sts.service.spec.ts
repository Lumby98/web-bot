import { StsService } from '../../../application.services/implementations/order-registration/sts/sts.service';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { stsOrderStub } from '../../stubs/sts-order.stub';
import { PuppeteerServiceInterface } from '../../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import { PuppeteerUtilityInterface } from '../../../domain.services/puppeteer-utility.interface';
import { STSInterface } from '../../../application.services/interfaces/order-registration/sts/STS.interface';
jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/puppeteer.service.ts',
);
describe('StsService', () => {
  let stsService: STSInterface;
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;

  beforeEach(async () => {
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
    describe('when a sts order-registration is returned', () => {
      const orderNumber = 'dfxdvcxv';
      let expected;
      beforeEach(async () => {
        expected = await stsService.handleSTSOrder(orderNumber);
      });
      it('should return an STS order-registration', () => {
        expect(expected).toEqual(stsOrderStub());
      });
    });
  });

  describe('inputStsModel', () => {
    describe('Should run with no errors', () => {
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValue(true);

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
