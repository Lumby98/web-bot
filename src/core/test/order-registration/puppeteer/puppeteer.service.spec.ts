import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('PuppeteerService', () => {
  let puppeteerService: PuppeteerService;
  let puppeteerUtil: PuppeteerUtilityInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuppeteerService,
        PuppeteerUtility,
        {
          provide: puppeteerUtilityInterfaceProvider,
          useClass: PuppeteerUtility,
        },
      ],
    }).compile();

    puppeteerService = module.get<PuppeteerService>(PuppeteerService);
    puppeteerUtil = module.get<PuppeteerUtilityInterface>(PuppeteerUtility);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(puppeteerService).toBeDefined();
  });

  describe('startPuppeteer', () => {
    const validURL = 'https://www.google.com/';

    describe('when startPuppeteer is called with a valid url', () => {
      beforeEach(async () => {
        await puppeteerService.startPuppeteer(validURL);
      });

      it('should call the order-registration-puppeteer.application.services start method with the right arguments', async () => {
        expect(puppeteerUtil.start).toBeCalledWith(false, validURL);
      });
    });

    describe('when startPuppeteer is called with an empty string', () => {
      const emptyURL = '';

      it('should throw an error with the right message', async () => {
        await expect(
          async () => await puppeteerService.startPuppeteer(emptyURL),
        ).rejects.toThrow('Invalid url, the given url is empty');
      });
    });

    describe('when startPuppeteer is called with an invalid url', () => {
      const invalidURL = 'www.yahoo.com';

      it('should throw an error with the right message', async () => {
        await expect(
          async () => await puppeteerService.startPuppeteer(invalidURL),
        ).rejects.toThrow('Invalid url, the given url is invalid');
      });
    });
  });

  describe('stopPuppeteer', () => {
    describe('when stopPuppeteer is called', () => {
      beforeEach(async () => {
        await puppeteerService.stopPuppeteer();
      });

      it('should call the order-registration-puppeteer.application.services stop method', async () => {
        expect(puppeteerUtil.stop).toBeCalled();
      });
    });
  });
});
