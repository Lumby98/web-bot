import { OrderInterface } from '../interfaces/order.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../interfaces/order-puppeteer.interface';
import { STSOrderModel } from '../models/sts-order.model';
import { OrderTypeEnum } from '../enums/type.enum';
import { LoginDto } from '../../ui.api/dto/user/login.dto';
import { INSSOrderModel } from '../models/ins-s-order.model';
import { OrderLists } from '../models/order-lists';

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
  async handleOrders(
    orderNumbers: string[],
    login: LoginDto,
  ): Promise<OrderLists> {
    const STSOrders: STSOrderModel[] = [];
    const INSOrders: INSSOrderModel[] = [];
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
          const INSS: INSSOrderModel = {
            orderNr: '123123',
            EU: true,
            deliveryAddress: 'gruss strasse 60',
            sizeL: '40',
            sizeR: '42',
            customerName: 'Klaus Riftbjerg',
            model: 'Bunka',
          };
          INSOrders.push(INSS);
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
    return {
      STSOrders: STSOrders,
      INSOrders: INSOrders,
    };
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
    const validateLogin = this.loginValidation(username, password);
    if (!validateLogin) {
      throw new Error('Wrong username or password');
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
    const check = await this.orderPuppeteer.checkLocation(
      'body > div.wrapper > div.content-wrapper > section.content-header > h1',
      false,
    );

    if (!check) {
      throw new Error('Could not find order page');
    }

    //Enable this in production.
    /*if (!(await this.orderPuppeteer.checkLocation('#edit_order', false))) {
      throw new Error('This order is delivered so it cannot be allocated');
    }*/

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

    const substring = 'Norway';
    if (order.deliveryAddress.includes(substring)) {
      order.EU = false;
    }

    return order;
  }

  /**
   * check if an order has an insole
   * @private
   */
  async checkForInsole(): Promise<boolean> {
    //Uncomment in production
    /* const location = await this.orderPuppeteer.checkLocation(
      '#edit_order',
      false,
    );*/
    /* if (!location) {
     throw new Error('failed to check for insole');
   }*/
    const insoleSelector =
      'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body > form > div:nth-child(4) > div > div > div.col-6.col-print-6 > table > tbody > tr:nth-child(2) > td:nth-child(2) > p';

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

  async createOrder(
    orders: OrderLists,
    username: string,
    password: string,
  ): Promise<string> {
    await this.orderPuppeteer.start(false, 'https://www.google.com/');
    await this.handleNeskridNavigation(username, password);
    await this.waitClick(
      '#page-content-wrapper > div.container-fluid > div:nth-child(2) > div.col-lg-3.col-md-4.col-sm-6.col-xs-6 > section > div.panel-body > div > div > div',
    );
    await this.waitClick(
      '#sitebody > div.cc-window.cc-banner.cc-type-opt-out.cc-theme-classic.cc-bottom > div > a.cc-btn.cc-dismiss',
    );
    console.log(orders.STSOrders.length);
    if (orders.STSOrders.length > 0) {
      for (const order of orders.STSOrders) {
        await this.waitClick(
          '#page-content-wrapper > div > div > div > section > div.panel-body > div > div:nth-child(3) > div',
        );
        await this.InputOrderInformation(
          order.orderNr,
          order.deliveryAddress,
          order.insole,
          order.EU,
        );
        await this.orderPuppeteer.checkLocation(
          '#page-content-wrapper > div > div > h1',
          false,
        );
        await this.inputUsageEnvironment(order.orderNr);
        await this.inputModel(order.model, order.sizeL, order.widthL);
        await this.supplement(order.insole);
      }
    }

    if (orders.INSOrders.length > 0) {
      return;
    }
    //await this.orderPuppeteer.stop();
    return 'complete';
  }

  async handleNeskridNavigation(username: string, password: string) {
    const validateLogin = this.loginValidation(username, password);
    if (!validateLogin) {
      throw new Error('Wrong username or password');
    }

    await this.goToURL('https://www.neskrid.com/');

    await this.orderPuppeteer.loginNeskrid(username, password);
    await this.orderPuppeteer.wait(
      '#page-content-wrapper > div.container-fluid > div:nth-child(1) > div > h1',
    );

    const desieredPage =
      'https://www.neskrid.com/plugins/neskrid/myneskrid_main.aspx';
    const currentUrl = await this.orderPuppeteer.getCurrentURL();
    if (desieredPage != currentUrl) {
      console.log(desieredPage);
      console.log(currentUrl);
      throw new Error('Failed to login to Neskrid');
    }
  }

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

  private async InputOrderInformation(
    orderNr: string,
    deliveryAddress: string,
    insole: boolean,
    EU: boolean,
  ) {
    await this.orderPuppeteer.wait('#order_ordernr');
    await this.orderPuppeteer.input('#order_ordernr', orderNr);
    if (insole) {
      await this.orderPuppeteer.input('#order_afladr_search', 'RODOTEKA');
      await this.orderPuppeteer.press('ArrowDown');
      await this.orderPuppeteer.press('Tab');
    } else if (EU) {
      await this.orderPuppeteer.input('#order_afladr_search', 'Ortowear');
      await this.orderPuppeteer.press('ArrowDown');
      await this.orderPuppeteer.press('Enter');
    } else {
      await this.orderPuppeteer.input('#order_afladr_search', deliveryAddress);
      await this.orderPuppeteer.press('ArrowDown');
      await this.orderPuppeteer.press('Enter');
    }
    await this.orderPuppeteer.wait('#order_afladr_form');
    await this.waitClick(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
    );
  }

  private async inputUsageEnvironment(orderNr: string) {
    await this.orderPuppeteer.wait('#order_enduser');
    await this.orderPuppeteer.input('#order_enduser', orderNr);
    await this.orderPuppeteer.dropdownSelect('#order_opt_9', 'Unknown');
    await this.orderPuppeteer.input('#order_function', 'N/A');
    await this.orderPuppeteer.dropdownSelect(
      '#order_opt_26',
      'Safety shoe with protective toecap (EN-ISO 20345:2011)',
    );
  }

  private async inputModel(model: string, size: string, width: string) {
    const models: string[] = await this.orderPuppeteer.getModelText(
      'div.col-md-7 > div.row > div > h3',
    );

    if (!models) {
      throw new Error('could not find models');
    }

    for (const m of models) {
      if (model.includes(m)) {
        await this.orderPuppeteer.selectByTexts(
          'div.col-md-7 > div.row > div > h3',
          m,
        );
        break;
      }
    }
    await this.orderPuppeteer.dropdownSelect('#order_opt_15', size);

    const splitter = width.split('-');
    if (splitter.length < 2) {
      throw new Error('invalied width');
    }

    await this.orderPuppeteer.dropdownSelect(
      '#order_opt_16',
      'w' + splitter[1],
    );

    await this.orderPuppeteer.click(
      '#scrollrbody > div.wizard_navigation.toggled > button.btn.btn-default.wizard_button_next',
    );
  }

  async supplement(insole: boolean) {
    if (insole) {
      await this.orderPuppeteer.wait('#order_info_14');
      this.orderPuppeteer.click('#order_info_14');
      this.orderPuppeteer.click('#choice_224');
    }
    //this.orderPuppeteer.click('#wizard_button_save')
  }

  async waitClick(selector: string) {
    await this.orderPuppeteer.wait(selector);
    await this.orderPuppeteer.click(selector);
  }
}
