import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import {
  stubBrowser,
  stubPage,
  stubElementHandle,
} from '../../../test/mock/mockPuppeteer';
import puppeteer from 'puppeteer';

jest.mock('puppeteer', () => ({
  lanuch() {
    return stubBrowser;
  },
}));

describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scrapNeskrid', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should return an array with a single link', async () => {
      jest
        .spyOn(stubPage, '$$')
        .mockReturnValue(Promise.resolve([stubElementHandle]));
      jest
        .spyOn(stubElementHandle, '$eval')
        .mockReturnValue(Promise.resolve('https://pizza.com'));
      const username = 'test';
      const password = 'test';
      const result = await service.scrapNeskrid(username, password);

      expect(result).toEqual(['https://pizza.com']);
    });

    it('should return an array with multiple links', async () => {
      jest
        .spyOn(stubPage, '$$')
        .mockReturnValue(
          Promise.resolve([stubElementHandle, stubElementHandle]),
        );
      const stubElementHandleSpy = jest
        .spyOn(stubElementHandle, '$eval')
        .mockReturnValueOnce(Promise.resolve('https://pizza.com'))
        .mockReturnValueOnce(Promise.resolve('https://github.com'));
      const username = 'test';
      const password = 'test';
      const result = await service.scrapNeskrid(username, password);

      expect(result).toEqual(['https://pizza.com', 'https://github.com']);
      expect(stubElementHandleSpy).toHaveBeenCalledTimes(2);
    });

    it('calls puppeteer.launch is called once', () => {
      const launchSpy = jest.spyOn(puppeteer, 'launch');
      const username = 'test';
      const password = 'test';

      service.scrapNeskrid(username, password);
      expect(launchSpy).toHaveBeenCalledTimes(1);
    });

    it('calls browser.newPage is called once', async () => {
      const browserNewPageSpy = jest.spyOn(stubBrowser, 'newPage');
      const username = 'test';
      const password = 'test';

      await service.scrapNeskrid(username, password);

      expect(browserNewPageSpy).toHaveBeenCalledTimes(1);
    });

    it('calls page.goto is called with "https://www.neskrid.com/"', async () => {
      const gotoSpy = jest.spyOn(stubPage, 'goto');
      const username = 'test';
      const password = 'test';
      await service.scrapNeskrid(username, password);

      expect(gotoSpy).toHaveBeenCalledWith('https://www.neskrid.com/');
    });

    it('throws error if page.goto cant be reached', async () => {
      const username = 'test';
      const password = 'test';

      return service
        .scrapNeskrid(username, password)
        .catch((e) =>
          expect(e).toEqual('something went wrong, neskrid might be down'),
        );
    });

    it('calls browser.close call once', async () => {
      const browserCloseSpy = jest.spyOn(stubBrowser, 'close');
      const username = 'test';
      const password = 'test';
      await service.scrapNeskrid(username, password);

      expect(browserCloseSpy).toHaveBeenCalledTimes(1);
    });
  });
});
