import { OrderInterface } from '../interfaces/order.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../interfaces/order-puppeteer.interface';
import { STSOrderModel } from '../models/sts-order.model';
import { OrderTypeEnum } from '../enums/type.enum';
import { LoginDto } from '../../ui.api/dto/user/login.dto';

@Injectable()
export class OrderService implements OrderInterface {
  constructor(
    @Inject(orderPuppeteerInterfaceProvider)
    private readonly orderPuppeteer: OrderPuppeteerInterface,
  ) {}

  /**
   * Takes a list of order-numbers and then calls the appropriate puppeteer methods,
   * in order to retrieve and return a complete list og order object with all the correct data.
   * @param orderNumbers
   * @param login
   */
  async handleOrders(orderNumbers: string[], login: LoginDto): Promise<any[]> {
    const STSOrders: STSOrderModel[] = [];
    const INSOrders: [] = [];
    const OSAOrders: [] = [];
    const SOSOrders: [] = [];
    await this.startPuppeteer('https://www.google.com/');
    await this.handleOrtowearNavigation(login.username, login.password);
    await this.goToURL('https://beta.ortowear.com/administration/ordersAdmin/');
    for (const orderNumber of orderNumbers) {
      const type = await this.getOrderType(orderNumber);
      let order;
      switch (type) {
        case OrderTypeEnum.STS:
          order = await this.handleSTSOrder(orderNumber);
          order.insole = await this.checkForInsole();
          STSOrders.push(order);
          break;
        case OrderTypeEnum.INSS:
          //todo
          break;
        case OrderTypeEnum.OSA:
          //todo
          break;
        case OrderTypeEnum.SOS:
          //todo
          break;
        default:
          throw new Error('could not determine order type');
      }
      await this.goToURL(
        'https://beta.ortowear.com/administration/ordersAdmin/',
      );
    }
    await this.stopPuppeteer();
    return [STSOrders, INSOrders, SOSOrders, OSAOrders];
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

  /**
   * navigates to Ortorwear and goes to the order list
   * @param username
   * @param password
   * @private
   */
  async handleOrtowearNavigation(username: string, password: string) {
    if (!username || !password) {
      throw new Error('Invalid username or password');
    }

    const emailRegex = new RegExp('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$');

    if (!emailRegex.test(username)) {
      throw new Error('Invalid username or password');
    }

    await this.goToURL('https://beta.ortowear.com/');

    await this.orderPuppeteer.loginOrtowear(username, password);
    await this.orderPuppeteer.wait(
      'div.home-main:nth-child(2) > div:nth-child(1)',
    );

    const myPageURL = 'https://beta.ortowear.com/my_page';
    const currentURL = await this.orderPuppeteer.getCurrentURL();
    if (myPageURL != currentURL) {
      if (
        await this.orderPuppeteer.checkLocation(
          '#loginForm > div.form-group.has-error > span > strong',
          false,
        )
      ) {
        throw new Error('Failed to login, but ortowear didnt display error');
      } else {
        const ortowearError = await this.getElementText(
          '#loginForm > div.form-group.has-error > span > strong',
        );
        throw new Error(
          'Failed to login, ortowear gave this error:' + ortowearError,
        );
      }
    }
  }

  /**
   * gets order type for the different order numbers given
   * @private
   * @param orderNumber
   */
  async getOrderType(orderNumber: string): Promise<OrderTypeEnum> {
    if (orderNumber.length < 1) {
      throw new Error('order number is blank');
    }

    const orderType = await this.orderPuppeteer.readType(orderNumber);

    switch (orderType) {
      case 'STS':
        return OrderTypeEnum.STS;

      case 'INS-S':
        return OrderTypeEnum.INSS;

      case 'OSA':
        return OrderTypeEnum.OSA;

      case 'SOS':
        return OrderTypeEnum.SOS;

      case 'No matching records found':
        throw new Error('could not find order');

      default:
        throw new Error('invalid order type');
    }
  }

  /**
   * get order information for an STS order
   * @param orderNumber
   * @private
   */
  async handleSTSOrder(orderNumber: string): Promise<STSOrderModel> {
    if (orderNumber.length < 1) {
      throw new Error('missing order number');
    }

    await this.orderPuppeteer.goToOrder(orderNumber);
    await this.orderPuppeteer.wait('#edit_order');

    const order: STSOrderModel = await this.orderPuppeteer.readSTSOrder(
      orderNumber,
    );
    if (!order) {
      throw new Error('failed getting order information');
    } else if (!order.toeCap || order.toeCap == '') {
      throw new Error('failed getting toe cap');
    } else if (order.orderNr != orderNumber) {
      throw new Error('failed getting correct order');
    } else if (!order.sole || order.sole == '') {
      throw new Error('failed getting sole');
    } else if (!order.widthR || order.widthR == '') {
      throw new Error('failled getting width for right shoe');
    } else if (!order.widthL || order.widthL == '') {
      throw new Error('failed getting width for left shoe');
    } else if (!order.sizeR || order.sizeR == '') {
      throw new Error('failed getting size for right shoe');
    } else if (!order.sizeL || order.sizeL == '') {
      throw new Error('failed getting size for left shoe');
    } else if (!order.model || order.model == '') {
      throw new Error('failed getting model');
    } else if (!order.deliveryAddress || order.deliveryAddress == '') {
      throw new Error('failed getting delivery address');
    } else if (!order.customerName || order.customerName == '') {
      throw new Error('failed getting customer');
    }
    return order;
  }

  /**
   * check if an order has an insole
   * @private
   */
  async checkForInsole(): Promise<boolean> {
    const location = await this.orderPuppeteer.checkLocation(
      '#edit_order',
      false,
    );
    const insoleSelector =
      'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(4) > div > div > div.col-6.col-print-6 > table > tbody > tr:nth-child(2) > td:nth-child(2) > p';
    if (!location) {
      throw new Error('failed to check for insole');
    }
    const doesCoverExist = await this.orderPuppeteer.checkLocation(
      insoleSelector,
      false,
    );

    if (!doesCoverExist) {
      return false;
    }

    const insole = await this.orderPuppeteer.readSelectorText(insoleSelector);

    if (insole.includes('EMMA')) {
      throw new Error('invalid order, EMMA order is not supported');
    }
    return true;
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

  async getElementText(selector: string): Promise<string> {
    const elementText = await this.orderPuppeteer.readSelectorText(selector);

    if (!elementText) {
      throw new Error('The text of the element is undefined');
    }

    if (elementText.length < 1) {
      throw new Error('The text of the element is empty');
    }

    return elementText;
  }
}
