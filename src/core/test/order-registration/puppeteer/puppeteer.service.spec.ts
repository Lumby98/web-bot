import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from '../../../application.services/implementations/order-registration/puppeteer/puppeteer.service';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../../../infrastructure/api/puppeteer.utility';
import { PuppeteerServiceInterface } from '../../../application.services/interfaces/puppeteer/puppeteer-service.Interface';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('PuppeteerService', () => {
  let puppeteerUtil: PuppeteerUtilityInterface;
  let puppeteerService: PuppeteerServiceInterface;

  beforeEach(async () => {
    puppeteerUtil = new PuppeteerUtility();
    puppeteerService = new PuppeteerService(puppeteerUtil);
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

      it('should call the puppeteer util start method with the right arguments', async () => {
        expect(puppeteerUtil.start).toBeCalledWith(false, validURL);
      });
    });
    describe('when going to wrong url', () => {
      const resultUrl = 'https://www.google.com/';
      const wrongUrl = 'https://www.yahoo.com';
      it('should throw a failed to navigate error', () => {
        expect(
          async () => await puppeteerService.startPuppeteer(wrongUrl),
        ).rejects.toThrow(
          'Navigation failed: went to the wrong URL: ' +
            resultUrl +
            ' : ' +
            wrongUrl,
        );
      });
    });
  });

  describe('stopPuppeteer', () => {
    describe('when stopPuppeteer is called', () => {
      beforeEach(async () => {
        await puppeteerService.stopPuppeteer();
      });

      it('should call the puppeteer util stop method', async () => {
        expect(puppeteerUtil.stop).toBeCalled();
      });
    });
  });

  describe('getElementTest', () => {
    describe('when called with valid selector', () => {
      const selector = 'validSelector';
      const expected = 'testString';
      let result;
      beforeEach(async () => {
        result = await puppeteerService.getElementText(selector);
      });
      it('should return element text', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when element cant be found', () => {
      const selector = 'selector';
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'checkLocation').mockResolvedValueOnce(false);
      });

      it('should throw a Could not find element error', async () => {
        await expect(
          async () => await puppeteerService.getElementText(selector),
        ).rejects.toThrow('Could not find element');
      });
    });

    describe('when element text is undefined', () => {
      const selector = 'selector';
      beforeEach(async () => {
        jest
          .spyOn(puppeteerUtil, 'readSelectorText')
          .mockResolvedValueOnce(undefined);
      });

      it('should throw a the text of the element is undefined error', async () => {
        await expect(
          async () => await puppeteerService.getElementText(selector),
        ).rejects.toThrow('The text of the element is undefined');
      });
    });

    describe('when element text is an empty string', () => {
      const selector = 'selector';
      beforeEach(async () => {
        jest.spyOn(puppeteerUtil, 'readSelectorText').mockResolvedValueOnce('');
      });

      it('should throw a The text of the element is empty error', async () => {
        await expect(
          async () => await puppeteerService.getElementText(selector),
        ).rejects.toThrow('The text of the element is empty');
      });
    });
  });

  describe('goToURL', () => {
    const validURL = 'https://www.google.com/';

    describe('when goToURl is called with a valid url', () => {
      beforeEach(async () => {
        await puppeteerService.goToURL(validURL);
      });

      it('should call the puppeteer util start method with the right arguments', async () => {
        expect(puppeteerUtil.navigateToURL).toBeCalledWith(validURL);
      });
    });

    describe('when going to wrong url', () => {
      const resultUrl = 'https://www.google.com/';
      const wrongUrl = 'https://www.yahoo.com';
      it('should throw a failed to navigate error', () => {
        expect(
          async () => await puppeteerService.goToURL(wrongUrl),
        ).rejects.toThrow(
          'Navigation failed: went to the wrong URL: ' +
            resultUrl +
            ' : ' +
            wrongUrl,
        );
      });
    });
  });

  describe('validateUrl', () => {
    describe('when validateUrl is called with an empty string', () => {
      const emptyURL = '';

      it('should throw an error with the right message', async () => {
        await expect(
          async () => await puppeteerService.validateUrl(emptyURL),
        ).rejects.toThrow('Invalid url, the given url is empty');
      });
    });

    describe('when validateUrl is called with an invalid url', () => {
      const invalidURL = 'www.yahoo.com';

      it('should throw an error with the right message', async () => {
        await expect(
          async () => await puppeteerService.validateUrl(invalidURL),
        ).rejects.toThrow('Invalid url, the given url is invalid');
      });
    });
  });

  describe('tryAgain', () => {
    describe('when tryAgain returns true on the first try', () => {
      const checkSelector = 'check';
      const clickSelector = 'click';
      const counter = 0;
      let result;
      beforeEach(async () => {
        result = await puppeteerService.tryAgain(
          checkSelector,
          clickSelector,
          counter,
        );
      });
      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when tryAgain returns true on the last try', () => {
      const checkSelector = 'check';
      const clickSelector = 'click';
      const counter = 0;
      let result;
      beforeEach(async () => {
        result = await puppeteerService.tryAgain(
          checkSelector,
          clickSelector,
          counter,
        );
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true);
      });
      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when counter reaches 10', () => {
      const checkSelector = 'check';
      const clickSelector = 'click';
      const counter = 0;
      beforeEach(() => {
        jest
          .spyOn(puppeteerUtil, 'checkLocation')
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(false);
      });
      it('should throw error when counter reaches 10', () => {
        expect(
          async () =>
            await puppeteerService.tryAgain(
              checkSelector,
              clickSelector,
              counter,
            ),
        ).rejects.toThrow('failed to try again: ' + checkSelector);
      });
    });
  });
});
