import { Inject, Injectable } from '@nestjs/common';
import { PuppeteerServiceInterface } from '../../../interfaces/puppeteer/puppeteer-service.Interface';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../../domain.services/puppeteer-utility.interface';

@Injectable()
export class PuppeteerService implements PuppeteerServiceInterface {
  constructor(
    @Inject(puppeteerUtilityInterfaceProvider)
    private readonly orderPuppeteer: PuppeteerUtilityInterface,
  ) {}

  /**
   * gets text from the given element through a selector string
   * @param selector
   */
  async getElementText(selector: string): Promise<string> {
    const check = await this.orderPuppeteer.checkLocation(
      selector,
      false,
      false,
    );

    if (!check) {
      throw new Error('Could not find element');
    }
    const elementText = await this.orderPuppeteer.readSelectorText(selector);

    if (elementText === undefined) {
      throw new Error('The text of the element is undefined');
    }

    if (elementText.length < 1) {
      throw new Error('The text of the element is empty');
    }

    return elementText;
  }

  /**
   * Tells puppeteer to navigate to a given URL.
   * @param url
   */
  async goToURL(url: string) {
    this.validateUrl(url);
    await this.orderPuppeteer.navigateToURL(url);

    const currentURL = await this.orderPuppeteer.getCurrentURL();
    if (currentURL != url) {
      throw new Error('Navigation failed: went to the wrong URL');
    }
  }

  /**
   * gets puppeteer up and running
   * @param url
   */
  async startPuppeteer(url: string) {
    this.validateUrl(url);

    await this.orderPuppeteer.start(false, url);
    const currentURL = await this.orderPuppeteer.getCurrentURL();
    if (currentURL != url) {
      throw new Error(
        'Navigation failed: went to the wrong URL: ' + currentURL + ' : ' + url,
      );
    }
  }

  validateUrl(url: string) {
    if (url.length < 1) {
      throw new Error('Invalid url, the given url is empty');
    }

    const urlRegex = new RegExp(
      '(http|ftp|https):\\/\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?',
    );

    if (!urlRegex.test(url)) {
      throw new Error('Invalid url, the given url is invalid');
    }
  }

  /**
   * stops puppeteer
   */
  async stopPuppeteer() {
    await this.orderPuppeteer.stop();
  }

  async tryAgain(
    checkSelector: string,
    clickSelector: string,
    counter: number,
  ): Promise<boolean> {
    const isChecked = await this.orderPuppeteer.checkLocation(
      checkSelector,
      false,
      true,
      2000,
    );

    if (!isChecked) {
      if (counter == 10) {
        throw new Error('failed to try again: ' + checkSelector);
      }

      counter++;
      //console.log('trying again ' + counter);
      await this.orderPuppeteer.click(clickSelector, true, true);
      return await this.tryAgain(checkSelector, clickSelector, counter);
    } else {
      return true;
    }
  }
}
