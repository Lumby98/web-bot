import { Inject, Injectable } from '@nestjs/common';
import { OrderPuppeteerInterface } from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';
import { OrderInsoleModel } from '../models/order-insole.model';
import { STSOrderModel } from '../models/sts-order.model';
import { Browser, Page } from 'puppeteer';

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
    this.browser = await this.puppeteer.launch({ headless: headless });
    this.page = await this.browser.newPage();
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

    //select order and go to its info page
    const target = await this.page.$eval(
      '#orders-table > tbody > tr > td',
      (el) => el.textContent,
    );

    //if an insole cannot be found return with a message to indicate the insole could not be found
    if (
      target == 'Ingen linjer matcher søgningen' ||
      target == 'No matching records found'
    ) {
      throw new Error('Could not find order');
    }

    await this.page.waitForSelector('#orders-table > tbody > tr');
    await this.page.click('#orders-table > tbody > tr');
    await this.page.click('#orders-table > tbody > tr');
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
    await this.checkLocation(
      'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(5) > td:nth-child(2)',
      false,
    );
    const pageOrdernumber = await this.readSelectorText(
      'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(5) > td:nth-child(2)',
    );
    if (pageOrdernumber != orderNumber) {
      throw new Error('order number does not match page');
    }

    let address;
    address = await this.readSelectorText(
      'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(1)',
    );
    address +=
      ' ' +
      (await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(2)',
      ));
    address +=
      ' ' +
      (await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3)',
      ));

    console.log(address);
    const order: STSOrderModel = {
      orderNr: pageOrdernumber,
      deliveryAddress: address,
      customerName: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)',
      ),
      model: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > p',
      ),
      sizeL: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > p',
      ),
      sizeR: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > p',
      ),
      widthL: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > p',
      ),
      widthR: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(3) > p',
      ),
      sole: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > p',
      ),
      toeCap: await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(2) > p',
      ),
    };
    console.log(order);
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

    //select insole and go to its info page
    const target = await this.page.$eval(
      '#orders-table > tbody > tr > td',
      (el) => el.textContent,
    );

    //if an insole cannot be found return with a message to indicate the insole could not be found
    if (
      target == 'Ingen linjer matcher søgningen' ||
      target == 'No matching records found'
    ) {
      throw new Error('Could not find order');
    }
    return await this.page.$eval(
      '#orders-table > tbody > tr > td:nth-child(1)',
      (el) => el.textContent,
    );
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

  async wait(selector: string) {
    await this.page.waitForSelector(selector);
  }
}
