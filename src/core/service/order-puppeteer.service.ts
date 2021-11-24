import { Injectable } from '@nestjs/common';
import { OrderPuppeteerInterface } from '../interfaces/order-puppeteer.interface';
import { STSOrderModel } from '../models/sts-order.model';
import { Browser, KeyInput, Page } from 'puppeteer';
import { TargetAndSelector } from '../models/target-and-selector';

@Injectable()
export class OrderPuppeteerService implements OrderPuppeteerInterface {
  puppeteer = require('puppeteer');
  page: Page;
  browser: Browser;

  /**
   * Launches puppeteer in the selected browsing mode,
   * then starts a new page and goes to the given URL.
   * @param headless
   * @param url
   */
  async start(headless: boolean, url: string) {
    this.browser = await this.puppeteer.launch({
      headless: headless,
      args: [`--window-size=1920,1080`],
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: 1920,
      height: 1080,
    });

    await this.page.goto(url);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Closes the browser thus stopping puppeteer,
   * clears the page instance.
   */
  async stop() {
    await this.browser.close();
    this.page = undefined;
  }

  /**
   * Navigates to the orders page
   * using the provided order-number.
   * @param orderNumber
   */
  async goToOrder(orderNumber: string) {
    //wait for page to be loaded
    await this.page.waitForSelector('#orders-table_processing', {
      hidden: true,
    });

    await this.page.click('#datatable_searchfield', {
      clickCount: 3,
      delay: 100,
    });

    await this.page.keyboard.press('Backspace');

    await this.page.type('#datatable_searchfield', orderNumber);

    //wait for page to find the order
    await this.page.waitForTimeout(2000);
    await this.page.waitForSelector('#orders-table_processing', {
      hidden: false,
    });
    await this.page.waitForSelector('#orders-table_processing', {
      hidden: true,
    });

    const targetAndSelector = await this.getTableTargetandSelector(orderNumber);

    await this.page.waitForSelector(targetAndSelector.selector);
    await this.page.click(targetAndSelector.selector);
    await this.page.click(
      '#topBtns > div > div > button.btn.btn-sm.btn-warning',
    );
  }

  /**
   * Navigates to the given URL.
   * @param url
   */
  async navigateToURL(url: string) {
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
    });
  }

  /**
   * Reads the data for an STSOrder from the page
   * then creates an STSOrderModel
   * which it returns.
   */
  async readSTSOrder(orderNumber: string): Promise<STSOrderModel> {
    const check = await this.checkLocation(
      'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(5) > td:nth-child(2)',
      false,
    );

    if (!check) {
      throw new Error('Could not read order number');
    }

    const pageOrdernumber = await this.readSelectorText(
      'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(5) > td:nth-child(2)',
    );
    if (pageOrdernumber != orderNumber) {
      throw new Error('order number does not match page');
    }

    let address;
    address = await this.readSelectorText(
      'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(1)',
    );
    address +=
      ' ' +
      (await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(2)',
      ));
    address +=
      ' ' +
      (await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3)',
      ));

    const order: STSOrderModel = {
      orderNr: pageOrdernumber,
      deliveryAddress: address,
      customerName: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)',
      ),
      model: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > p',
      ),
      sizeL: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > p',
      ),
      sizeR: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > p',
      ),
      widthL: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > p',
      ),
      widthR: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(3) > p',
      ),
      sole: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > p',
      ),
      toeCap: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(2) > p',
      ),
      EU: true,
    };
    return order;
  }

  /**
   * Reads the order type for the order with the given order-number.
   * @param orderNumber
   */
  async readType(orderNumber: string): Promise<string> {
    //wait for page to be loaded
    await this.page.waitForSelector('#orders-table_processing', {
      hidden: true,
    });

    await this.page.click('#datatable_searchfield', {
      clickCount: 3,
      delay: 100,
    });

    await this.page.keyboard.press('Backspace');

    await this.page.type('#datatable_searchfield', orderNumber);

    //wait for page to find the insole
    await this.page.waitForTimeout(2000);
    await this.page.waitForSelector('#orders-table_processing', {
      hidden: false,
    });
    await this.page.waitForSelector('#orders-table_processing', {
      hidden: true,
    });

    const targetAndSelector = await this.getTableTargetandSelector(orderNumber);

    return targetAndSelector.type;
  }

  async getTableTargetandSelector(
    orderNumber: string,
  ): Promise<TargetAndSelector> {
    //select insole and go to its info page
    const warning = await this.page.$eval(
      '#orders-table > tbody > tr > td',
      (el) => el.textContent,
    );

    //if an insole cannot be found return with a message to indicate the insole could not be found
    if (
      warning == 'Ingen linjer matcher søgningen' ||
      warning == 'No matching records found'
    ) {
      throw new Error('Could not find order' + warning);
    }

    const data = await this.page.$$eval(
      '#orders-table > tbody > tr > td:nth-child(6) > pre',
      (tds) =>
        tds.map((td) => {
          return td.textContent;
        }),
    );

    let target;
    let selector;
    let type;
    if (data.length > 1) {
      for (let i = 0; i < data.length; i++) {
        if (orderNumber.includes(data[i])) {
          selector = `#orders-table > tbody > tr:nth-child(${
            i + 1
          }) > td:nth-child(6) > pre`;
          target = await this.page.$eval(selector, (el) => el.textContent);
          type = await this.page.$eval(
            `#orders-table > tbody > tr:nth-child(${i + 1}) > td:nth-child(1)`,
            (el) => el.textContent,
          );
        }
      }
    } else {
      selector = `#orders-table > tbody > tr:nth-child(1) > td:nth-child(6) > pre`;
      target = await this.page.$eval(selector, (el) => el.textContent);
      type = await this.page.$eval(
        `#orders-table > tbody > tr:nth-child(1) > td:nth-child(1)`,
        (el) => el.textContent,
      );
    }

    return {
      target: target,
      selector: selector,
      type: type,
    };
  }

  /**
   * Navigates to ortowear
   * and then logs in with the given username and password.
   * @param username
   * @param password
   */
  async loginOrtowear(username: string, password: string) {
    //inputs username and password
    await this.page.type('#email', username);
    await this.page.type('#password', password);

    //clicks login button
    await this.page.waitForSelector('#loginForm > input.btn.btn-ow');
    await this.page.click('#loginForm > input.btn.btn-ow');
  }

  /**
   * Checks if the element that the given selector points to exists.
   * @param selector
   * @param hidden
   */
  async checkLocation(selector: string, hidden: boolean): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        timeout: 8000,
        hidden: hidden,
      });
    } catch (err) {
      return false;
    }

    return true;
  }

  /**
   * Gets the URL.
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Finds the given selector on the page,
   * then reads and returns its text content.
   */
  async readSelectorText(selector: string): Promise<string> {
    return await this.page.$eval(selector, (el) => el.textContent);
  }

  /**
   * waits for selector
   * @param selector
   */
  async wait(selector: string) {
    await this.page.waitForSelector(selector);
  }

  /**
   * logs into neskrid
   * @param username
   * @param password
   */
  loginNeskrid(username: string, password: string) {}

  async click(selector: string) {
    await this.page.click(selector);
  }

  /**
   * gets texts based on selector
   * @param selector
   */
  getModelText(selector: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  /**
   * inputs text into a text field
   * @param selector
   * @param text
   */
  async input(selector: string, text: string) {
    await this.page.type(selector, text);
  }

  /**
   * presses a key
   * @param key
   */
  async press(key: KeyInput) {
    await this.page.keyboard.press(key);
  }

  /**
   * selects item in dropdown menu
   * @param selector
   * @param value
   */
  select(selector: string, value: string) {}

  /**
   * selects based on given text instead of selector
   * @param text
   */
  selectByTexts(text: string) {}
}
