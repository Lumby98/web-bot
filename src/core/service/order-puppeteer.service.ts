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
      defaultViewport: null,
    });
    this.page = await this.browser.newPage();

    await this.page.goto(url);
    this.page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
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
   * Navigates to the given URL.
   * @param url
   */
  async navigateToURL(url: string) {
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
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

    const address: string[] = [];
    address.push(
      await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(1)',
      ),
    );
    address.push(
      await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(2)',
      ),
    );
    address.push(
      await this.readSelectorText(
        'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(2) > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3)',
      ),
    );

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

  async getTableTargetandSelector(
    orderNumber: string,
  ): Promise<TargetAndSelector> {
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
   * @param visible
   */
  async checkLocation(
    selector: string,
    hidden: boolean,
    visible: boolean,
  ): Promise<boolean> {
    try {
      const element = await this.page.waitForSelector(selector, {
        timeout: 8000,
        hidden: hidden,
        visible: visible,
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

  async getInputValue(selector: string): Promise<string> {
    return await this.page.$eval(selector, (el: HTMLInputElement) => el.value);
  }

  /**
   * waits for selector
   * @param selector
   * @param timeout
   */
  async wait(selector?: string, timeout?: number) {
    if (selector) {
      await this.page.waitForSelector(selector);
    } else if (timeout) {
      await this.page.waitForTimeout(timeout);
    } else if (selector && timeout) {
      await this.page.waitForSelector(selector, { timeout: timeout });
    } else {
      throw new Error('invalid arguments');
    }
  }

  /**
   * logs into neskrid
   * @param username
   * @param password
   */
  async loginNeskrid(username: string, password: string) {
    let isLanguageModal = await this.checkLocation(
      '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      false,
      false,
    );

    if (!isLanguageModal) {
      await this.wait(
        '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      );
    }

    isLanguageModal = await this.checkLocation(
      '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      false,
      true,
    );

    if (!isLanguageModal) {
      throw new Error('Neskrid didnt load language modal');
    }

    await this.page.click(
      '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
    );
    await this.page.waitForSelector('#sitebody');
    await this.page.waitForSelector(
      '#sitebody > div.navbar.navbar-fixed-top.subpage > div > div.navbar-collapse.collapse > ul > li:nth-child(6) > a',
    );
    await this.page.click(
      '#sitebody > div.navbar.navbar-fixed-top.subpage > div > div.navbar-collapse.collapse > ul > li:nth-child(6) > a',
    );

    let isLoginlLoaded = await this.checkLocation(
      '#gebruikerscode',
      false,
      true,
    );

    if (!isLoginlLoaded) {
      console.log('Clicked next again');
      await this.page.click(
        '#sitebody > div.navbar.navbar-fixed-top.subpage > div > div.navbar-collapse.collapse > ul > li:nth-child(6) > a',
      );
    }

    isLoginlLoaded = await this.checkLocation('#gebruikerscode', false, true);
    if (!isLoginlLoaded) {
      throw new Error('Could not load Login modal');
    }

    await this.page.waitForSelector('#gebruikerscode', { visible: true });
    await this.page.type('#gebruikerscode', username);
    await this.page.type('#gebruikerspass', password);
    await this.page.waitForSelector(
      '#login-modal > div > div > div.modal-body > div > form > button',
      { visible: true },
    );
    await this.page.click(
      '#login-modal > div > div > div.modal-body > div > form > button',
    );
  }

  async click(selector: string, hover: boolean) {
    if (hover) {
      await this.page.hover(selector);
    }

    await this.page.click(selector);
  }

  /**
   * gets texts based on selector
   * @param selector
   */
  async getModelText(selector: string): Promise<string[]> {
    return await this.page.$$eval(selector, (el) => {
      const modelTextArray = el.map((e) => e.textContent);
      if (modelTextArray.length < 1) {
        throw new Error(
          'Failed to find model names: ' + modelTextArray.length.toString(),
        );
      }
      return modelTextArray;
    });
  }

  /**
   * inputs text into a text field
   * @param selector
   * @param text
   */
  async input(selector: string, text: string) {
    await this.page.click(selector, {
      clickCount: 3,
      delay: 100,
    });

    await this.page.keyboard.press('Backspace');

    await this.page.type(selector, text, { delay: 200 });
    await this.page.waitForTimeout(2000);
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
   * @param textValue
   */
  async dropdownSelect(selector: string, textValue: string) {
    const dataValue = await this.page.$$eval(
      'option',
      (elements: HTMLInputElement[], text: string) => {
        const htmlInputElement = elements.find((o) => {
          const uppercaseText = o.textContent.toLocaleUpperCase();
          return uppercaseText.includes(text.toLocaleUpperCase());
        });
        if (!htmlInputElement) {
          throw new Error(
            'Found no matching option for:\n' +
              'text value: ' +
              text +
              '\n' +
              'elements are: ' +
              elements.map((o) => {
                return o.textContent;
              }),
          );
        }
        return htmlInputElement.value;
      },
      textValue,
    );

    await this.page.select(selector, dataValue);
  }

  async selectDate(date: number): Promise<string> {
    for (let tr = 1; tr <= 6; tr++) {
      for (let td = 1; td <= 7; td++) {
        const currentSelector = `#ui-datepicker-div > table > tbody > tr:nth-child(${tr}) > td:nth-child(${td}) > a`;
        const cellCheck = await this.checkLocation(
          currentSelector,
          false,
          true,
        );

        if (cellCheck) {
          const cellDate = Number.parseInt(
            await this.readSelectorText(currentSelector),
          );

          if (date == cellDate) {
            return currentSelector;
          }
        }
      }
    }
  }

  /**
   * selects based on given text instead of selector
   * @param selector
   * @param textValue
   */
  async selectByTexts(selector: string, textValue: string) {
    const element = await this.page.$$eval(
      selector,
      (el, text: string) => {
        return el.find((e) => e.textContent === text).id;
      },
      textValue,
    );
    await this.page.click(element);
  }

  /**
   * Selects and option in a given select by given value
   * @param selector
   * @param value
   */
  async selectDropdownByValue(selector: string, value: string) {
    await this.page.select(selector, value);
  }

  async getSelectedValue(selector: string): Promise<string> {
    return await this.page.$eval(
      selector,
      (selectedValue: HTMLInputElement) => selectedValue.value,
    );
  }

  async getCSSofElement(selector: string, property: string): Promise<string> {
    return await this.page.$eval(selector, (el) => {
      const stylesObject = getComputedStyle(el);
      return stylesObject.backgroundColor;
    });
  }
  /*//I have tried.
  async selectByTexts(selector: string, textValue: string) {
    const elements = await this.page.$$(selector);
    const element = await elements.find(async (e) => {
      const textContent = await e.evaluate((node) => node.textContent);
      return textContent === textValue;
    });
    if (!element) {
      throw new Error('The element is invalid: ' + element);
    }
    console.log(element.toString());

    const parentHandle = await this.page.evaluateHandle(
      (e) => e.parent,
      element,
    );

    const parentElement = parentHandle.asElement();
    console.log(parentHandle.toString());
    const id = await parentElement.evaluate((node: Element) => node.id);

    if (!id || id === '') {
      throw new Error('The id is invalid: ' + id);
    }

    console.log('id is: ' + id.toString());
    await this.page.click(id);
  }*/
}
