import { Inject, Injectable } from '@nestjs/common';
import { OrderRegistrationInterface } from '../../../interfaces/order-registration/order/order-registration.interface';
import { DateTime } from 'luxon';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../../domain.services/puppeteer-utility.interface';
import { OrderTypeEnum } from '../../../../enums/type.enum';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../../interfaces/puppeteer/puppeteer-service.Interface';
import { ConfigService } from '@nestjs/config';
import { TargetAndSelector } from '../../../../models/target-and-selector';

@Injectable()
export class OrderRegistrationService implements OrderRegistrationInterface {
  constructor(
    @Inject(puppeteerUtilityInterfaceProvider)
    private readonly puppeteerUtil: PuppeteerUtilityInterface,
    @Inject(puppeteerServiceInterfaceProvider)
    private readonly puppeteerService: PuppeteerServiceInterface,
    private configService: ConfigService,
  ) {}

  /**
   * handles inputting the order information
   * @param orderNr
   * @param deliveryAddress
   * @param insole
   * @param EU
   * @param customerName
   * @constructor
   */
  async InputOrderInformation(
    orderNr: string,
    deliveryAddress: string[],
    insole: boolean,
    EU: boolean,
    customerName: string,
  ) {
    await this.puppeteerUtil.wait('#order_ordernr');
    await this.puppeteerUtil.input('#order_ordernr', orderNr);
    if (insole) {
      await this.puppeteerUtil.input('#order_afladr_search', 'RODOTEKA');
      await this.puppeteerUtil.click(
        '#order_afladr > div > div.panel-heading > div > div > div',
        true,
        true,
      );
    } else if (EU) {
      await this.puppeteerUtil.input('#order_afladr_search', 'Ortowear');
      await this.puppeteerUtil.click(
        '#order_afladr > div > div.panel-heading > div > div > div',
        true,
        true,
      );
    } else {
      await this.puppeteerUtil.input('#order_afladr_search', customerName);
      await this.puppeteerUtil.click(
        '#order_afladr > div > div.panel-heading > div > div > div',
        true,
        true,
      );
      await this.inputAddress(deliveryAddress, orderNr, customerName);
    }
    await this.puppeteerUtil.wait('#order_afladr_name');
    await this.puppeteerUtil.click(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      true,
      true,
    );

    const isInUsageEnvoPage = await this.puppeteerUtil.checkLocation(
      '#order_enduser',
      false,
      false,
    );

    if (!isInUsageEnvoPage) {
      console.log('Clicked next again');
      await this.puppeteerService.tryAgain(
        '#order_enduser',
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        0,
      );
    }
  }

  /**
   * adjusts the month on the calendar on ortowear
   * @param timeOfDelivery
   * @param ortowearMonth
   * @param counter
   */
  async adjustMonth(
    timeOfDelivery: Date,
    ortowearMonth: string,
    counter: number,
  ): Promise<boolean> {
    if (counter > 100) {
      throw new Error('Failed to adjust month: loop overload');
    }

    const orderMonthNumber = timeOfDelivery.getMonth() + 1;
    const ortowearMonthNumber = this.getMonthFromString(ortowearMonth);
    console.log(
      'orderMonthNumber' +
        orderMonthNumber +
        ' ortowearMonthNumber' +
        ortowearMonthNumber,
    );

    if (orderMonthNumber != ortowearMonthNumber) {
      if (orderMonthNumber > ortowearMonthNumber) {
        await this.puppeteerUtil.click(
          '#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all',
          true,
          true,
        );

        const newMonth = await this.puppeteerService.getElementText(
          '#ui-datepicker-div > div > div > span.ui-datepicker-month',
        );

        counter++;
        return await this.adjustMonth(timeOfDelivery, newMonth, counter);
      } else {
        throw new Error('Cannot set delivery date in the past');
      }
    } else {
      return true;
    }
  }

  /**
   * adjusts the year on the calendar on ortowear
   * @param orderYear
   * @param ortowearYear
   * @param counter
   */
  async adjustYear(
    orderYear: number,
    ortowearYear: number,
    counter: number,
  ): Promise<boolean> {
    if (counter > 100) {
      throw new Error('Failed to adjust year: loop overload');
    }

    if (orderYear != ortowearYear) {
      if (orderYear > ortowearYear) {
        await this.puppeteerUtil.click(
          '#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all',
          true,
          true,
        );
        const newYear = await this.puppeteerService.getElementText(
          '#ui-datepicker-div > div > div > span.ui-datepicker-year',
        );

        const numberOrtowearYear = Number.parseInt(newYear);

        counter++;
        return await this.adjustYear(orderYear, numberOrtowearYear, counter);
      } else {
        throw new Error('Cannot set delivery date in the past');
      }
    } else {
      return true;
    }
  }

  /**
   * check if an order-registration has an insole
   * @private
   */
  async checkForInsole(): Promise<boolean> {
    const insoleSelector =
      'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(4) > div > div > div.col-6.col-print-6 > table > tbody > tr:nth-child(2) > td:nth-child(2) > p';

    const doesCoverExist = await this.puppeteerUtil.checkLocation(
      insoleSelector,
      false,
      false,
    );

    if (!doesCoverExist) {
      return false;
    }

    const insole = await this.puppeteerUtil.readSelectorText(insoleSelector);

    if (insole.includes('EMMA')) {
      throw new Error(
        'invalid order-registration, EMMA order-registration is not supported',
      );
    }
    return true;
  }

  /**
   * Formats strings to a format that the javascript Date class will accept.
   * Formats from this: 'mm/dd/yyyy'
   * Formats to this format: 'yyyy-mm-ddThh:mm:ssZ'
   * @param deliveryDateString
   */
  formatDeliveryDate(deliveryDateString: string): Date {
    console.log(deliveryDateString);
    const splitDate = deliveryDateString.split('/');
    const year = Number.parseInt(splitDate[2]);
    const month = Number.parseInt(splitDate[0]) - 1;
    const date = Number.parseInt(splitDate[1]);
    const formattedDate = new Date(year, month, date);
    console.log(
      `Year: ${year}, Month: ${month}, Date: ${date}, formatedDate: ${formattedDate}`,
    );
    return formattedDate;
  }

  /**
   * gets a month from the given string
   * @param month
   */
  getMonthFromString(month: string): number {
    const d = Date.parse(month + '1, 2012');
    if (!isNaN(d)) {
      return new Date(d).getMonth() + 1;
    }
    throw new Error(
      `Failed to get month from string, input was this: ${month}`,
    );
  }

  /**
   * gets the next weekday
   * @param date
   * @param dayOfWeek
   */
  getNextDayOfWeek(date: Date, dayOfWeek: number): Date {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error(
        'Invalid day of the week: the day of the week should be from 0-6',
      );
    }

    let luxDate = DateTime.fromJSDate(date);

    luxDate = luxDate.plus({
      days: ((7 + dayOfWeek - date.getDay() - 1) % 7) + 1,
    });

    console.log(luxDate.toJSDate());
    return luxDate.toJSDate();
  }

  /**
   * gets order-registration type for the different order-registration numbers given
   * @private
   * @param type
   */
  async getOrderType(type: string): Promise<OrderTypeEnum> {
    switch (type) {
      case 'STS':
        return OrderTypeEnum.STS;

      case 'INS-S':
        return OrderTypeEnum.INSS;

      case 'INS':
        return OrderTypeEnum.INSS;

      case 'OSA':
        return OrderTypeEnum.OSA;

      case 'SOS':
        return OrderTypeEnum.SOS;

      case 'No matching records found':
        throw new Error('could not find order-registration');

      default:
        throw new Error(
          'invalid order-registration type ' +
            'Order type was ' +
            type +
            ' This program supports STS, INS-S, OSA and SOS orders only.',
        );
    }
  }

  /**
   * handles navigation on neskrid
   * @param username
   * @param password
   */
  async handleNeskridNavigation(username: string, password: string) {
    const validateLogin = this.loginValidation(username, password);
    if (!validateLogin) {
      throw new Error('Wrong username or password');
    }

    await this.puppeteerService.goToURL('https://www.neskrid.com/');

    await this.puppeteerUtil.loginNeskrid(username, password);
    await this.puppeteerUtil.wait(
      '#page-content-wrapper > div.container-fluid > div:nth-child(1) > div > h1',
    );

    const desieredPage =
      'https://www.neskrid.com/plugins/neskrid/myneskrid_main.aspx';
    const currentUrl = await this.puppeteerUtil.getCurrentURL();
    if (desieredPage != currentUrl) {
      console.log(desieredPage);
      console.log(currentUrl);
      throw new Error('Failed to login to Neskrid');
    }
  }

  /**
   * Handles the completion of the order-registration on neskrid.
   * Should return something like this: '26/11/2021'
   * @param dev
   * @param completeOrder
   */
  async handleOrderCompletion(
    dev: boolean,
    completeOrder: boolean,
  ): Promise<string> {
    if (dev) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);

      console.log(
        `Date is : ${
          newDate.getMonth() + 1
        }/${newDate.getDate()}/${newDate.getFullYear()}`,
      );
      //return '12/23/2021';
      return `${
        newDate.getMonth() + 1
      }/${newDate.getDate()}/${newDate.getFullYear()}`;
    }
    await this.puppeteerUtil.click('#wizard_button_save', true, true);
    const pageCheck = await this.puppeteerUtil.checkLocation(
      '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
      false,
      false,
    );
    if (!pageCheck) {
      await this.puppeteerService.tryAgain(
        '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
        '#wizard_button_save',
        0,
      );
    }
    await this.puppeteerUtil.click(
      '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
      false,
      true,
    );
    const modal = await this.puppeteerUtil.checkLocation(
      '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div',
      false,
      true,
    );
    if (!modal) {
      this.puppeteerService.tryAgain(
        '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div',
        '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
        0,
      );
    }
    const dd = this.puppeteerUtil.checkLocation(
      '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > table.table.mar-bot30 > tbody > tr:nth-child(2) > td:nth-child(3)',
      false,
      true,
    );
    let deliveryDate;
    if (dd) {
      await this.puppeteerUtil.wait(null, 2000);
      deliveryDate = await this.puppeteerUtil.readSelectorText(
        '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > table.table.mar-bot30 > tbody > tr:nth-child(2) > td:nth-child(3)',
      );
    } else {
      throw new Error('failed to get deliveryDate');
    }

    const checkboxCheck = await this.puppeteerUtil.checkLocation(
      '#order_cemaxnconf',
      false,
      true,
    );

    if (checkboxCheck) {
      await this.puppeteerUtil.clickRadioButton('#order_cemaxnconf');
    }

    await this.puppeteerUtil.wait(undefined, 10000);

    if (completeOrder) {
      // confirm btn
      await this.puppeteerUtil.click(
        '#choiceinvalid-footer > button.btn.btn-success',
        true,
        true,
      );
      await this.puppeteerUtil.wait(null, 5000);
    } else {
      //cancel btn
      await this.puppeteerUtil.click(
        '#choiceinvalid-footer > button.btn.btn-default',
        true,
        true,
      );
      await this.puppeteerUtil.click(
        '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-danger',
        true,
        true,
      );
    }

    return deliveryDate;
  }

  /**
   * navigates to Ortorwear and goes to the order-registration list
   * @param username
   * @param password
   * @private
   */
  async handleOrtowearNavigation(username: string, password: string) {
    const validateLogin = this.loginValidation(username, password);
    if (!validateLogin) {
      throw new Error('Wrong username or password');
    }
    /**
     * TODO wait for the page to load
     */

    await this.puppeteerService.goToURL(this.configService.get('ORTOWEARURL'));

    await this.puppeteerUtil.loginOrtowear(username, password);

    let checklocation = await this.puppeteerUtil.checkLocation(
      'div.home-main:nth-child(2) > div:nth-child(1)',
      false,
      true,
    );

    if (!checklocation) {
      checklocation = await this.puppeteerUtil.checkLocation(
        'div.home-main:nth-child(2) > div:nth-child(1)',
        false,
        true,
        30000,
      );
    }

    if (!checklocation) {
      if (
        await this.puppeteerUtil.checkLocation(
          '#loginForm > div.form-group.has-error > span > strong',
          false,
          true,
        )
      ) {
        const ortowearError = await this.puppeteerService.getElementText(
          '#loginForm > div.form-group.has-error > span > strong',
        );
        throw new Error(
          'Failed to login, ortowear gave this error:' + ortowearError,
        );
      } else {
        throw new Error(
          'Failed to login, but ortowear didnt display error, if this happens then Ortowear is most likely down.',
        );
      }
    }

    const myPageURL = this.configService.get('ORTOWEARURL') + 'my_page';
    const currentURL = await this.puppeteerUtil.getCurrentURL();
    if (myPageURL != currentURL) {
      if (
        await this.puppeteerUtil.checkLocation(
          '#loginForm > div.form-group.has-error > span > strong',
          false,
          false,
        )
      ) {
        throw new Error(
          'Failed to login, but ortowear didnt display error' +
            myPageURL +
            ' ' +
            currentURL,
        );
      } else {
        const ortowearError = await this.puppeteerService.getElementText(
          '#loginForm > div.form-group.has-error > span > strong',
        );
        throw new Error(
          'Failed to login, ortowear gave this error:' + ortowearError,
        );
      }
    }
  }

  /**
   * inputs the given address
   * @param deliveryAddress
   * @param orderNr
   * @param customerName
   */
  async inputAddress(
    deliveryAddress: string[],
    orderNr: string,
    customerName: string,
  ) {
    await this.puppeteerUtil.wait('#order_afladr_form');
    await this.puppeteerUtil.input('#order_afladr_name', customerName);

    const address = deliveryAddress[0].split(' ');

    await this.puppeteerUtil.input('#order_afladr_street', address[0]);

    await this.puppeteerUtil.input('#order_afladr_nr', address[1]);

    const postalCodeandCity = deliveryAddress[1].split(' ');

    await this.puppeteerUtil.input('#order_afladr_zip', postalCodeandCity[0]);

    await this.puppeteerUtil.input('#order_afladr_place', postalCodeandCity[1]);

    const country = deliveryAddress[2].split(' ');

    await this.puppeteerUtil.input('#order_afladr_zip', postalCodeandCity[0]);
  }

  /**
   * validates the given login
   * @param username
   * @param password
   */
  loginValidation(username: string, password: string): boolean {
    if (!username || !password) {
      return false;
    }

    const emailRegex = new RegExp('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$');

    if (!emailRegex.test(username)) {
      return false;
    }

    return true;
  }

  /**
   * gets information in tables on ortowear
   * @param orderNumber
   */
  async getTableInfo(orderNumber: string): Promise<TargetAndSelector> {
    return await this.puppeteerUtil.getTableTargetandSelector(orderNumber);
  }
}
