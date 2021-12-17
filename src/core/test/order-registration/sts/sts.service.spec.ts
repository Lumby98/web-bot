import { StsService } from '../../../application.services/implementations/order-registration/sts/sts.service';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { stsOrderStub } from '../../stubs/sts-order.stub';
jest.mock('src/infrastructure/api/puppeteer.utility.ts');
jest.mock(
  'src/core/application.services/implementations/order-registration/puppeteer/webbot.service.ts',
);
describe('StsService', () => {
  let stsService: StsService;
  let puppeteerUtil: PuppeteerUtility;
  let webbotService: PuppeteerService;

  beforeEach(async () => {
    puppeteerUtil = new PuppeteerUtility();
    webbotService = new PuppeteerService(puppeteerUtil);
    stsService = new StsService(puppeteerUtil, webbotService);
    jest.clearAllMocks();
  });

  it('puppeteerUtil should be defined', () => {
    expect(puppeteerUtil).toBeDefined();
  });

  it('webbotService should be defined', () => {
    expect(webbotService).toBeDefined();
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
        expect(webbotService.tryAgain).toBeCalledWith(
          '#order_info_14',
          '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
          0,
        );
      });
    });
  });
});
