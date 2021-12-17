import { Inject, Injectable } from '@nestjs/common';
import { PuppeteerServiceInterface } from '../../../interfaces/puppeteer/puppeteerServiceInterface';
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

  async getElementText(selector: string): Promise<string> {
    const check = this.orderPuppeteer.checkLocation(selector, false, false);

    if (!check) {
      throw new Error('Could not find element');
    }
    const elementText = await this.orderPuppeteer.readSelectorText(selector);

    if (!elementText) {
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
    if (url.length < 1) {
      throw new Error('Invalid url, the given url is empty');
    }

    const urlRegex = new RegExp(
      '(http|ftp|https):\\/\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?',
    );

    if (!urlRegex.test(url)) {
      throw new Error('Invalid url, the given url is invalid');
    }

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
    if (url.length < 1) {
      throw new Error('Invalid url, the given url is empty');
    }

    const urlRegex = new RegExp(
      '(http|ftp|https):\\/\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?',
    );

    if (!urlRegex.test(url)) {
      throw new Error('Invalid url, the given url is invalid');
    }

    await this.orderPuppeteer.start(false, url);
    const currentURL = await this.orderPuppeteer.getCurrentURL();
    if (currentURL != url) {
      throw new Error(
        'Navigation failed: went to the wrong URL: ' + currentURL + ' : ' + url,
      );
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
  ) {
    const isChecked = await this.orderPuppeteer.checkLocation(
      checkSelector,
      false,
      true,
    );

    if (!isChecked) {
      if (counter == 5) {
        throw new Error('failed to try again: ' + checkSelector);
      }
      counter++;
      console.log('trying again' + counter);
      await this.orderPuppeteer.click(clickSelector, true, true);
      return await this.tryAgain(checkSelector, clickSelector, counter);
    }
  }
}
