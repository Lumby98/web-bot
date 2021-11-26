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
            deliveryAddress: [
              'Borgervaenget 5',
              '2100 Koebenhavn',
              'Kobenhavn, Denmark',
            ],
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
    } else if (!order.deliveryAddress || order.deliveryAddress.length < 3) {
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
          order.customerName,
        );
        const isInUsageEnvoPage = await this.orderPuppeteer.checkLocation(
          '#page-content-wrapper > div > div > h1',
          false,
          false,
        );

        if (!isInUsageEnvoPage) {
          throw new Error('Could not load usage envoirment page.');
        }

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
    deliveryAddress: string[],
    insole: boolean,
    EU: boolean,
    customerName: string,
  ) {
    await this.orderPuppeteer.wait('#order_ordernr');
    await this.orderPuppeteer.input('#order_ordernr', orderNr);
    if (insole) {
      await this.orderPuppeteer.input('#order_afladr_search', 'RODOTEKA');
      await this.waitClick(
        '#order_afladr > div > div.panel-heading > div > div > div',
      );
    } else if (EU) {
      await this.orderPuppeteer.input('#order_afladr_search', 'Ortowear');
      await this.waitClick(
        '#order_afladr > div > div.panel-heading > div > div > div',
      );
    } else {
      await this.orderPuppeteer.input('#order_afladr_search', customerName);
      await this.waitClick(
        '#order_afladr > div > div.panel-heading > div > div > div',
      );
      await this.inputAddress(deliveryAddress, orderNr, customerName);
    }
    await this.orderPuppeteer.wait('#order_afladr_name');
    await this.waitClick(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
    );

    const isInUsageEnvoPage = await this.orderPuppeteer.checkLocation(
      '#order_enduser',
      false,
      false,
    );

    if (!isInUsageEnvoPage) {
      console.log('Clicked next again');
      await this.waitClick(
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      );
    }
  }

  private async inputUsageEnvironment(orderNr: string) {
    const endUserIsLoaded = await this.orderPuppeteer.checkLocation(
      '#order_enduser',
      false,
      false,
    );

    if (!endUserIsLoaded) {
      throw new Error('Could not load end user input');
    }
    await this.orderPuppeteer.input('#order_enduser', orderNr);

    let endUserText = await this.orderPuppeteer.getInputValue('#order_enduser');
    if (endUserText !== orderNr) {
      await this.orderPuppeteer.input('#order_enduser', orderNr);
    }

    endUserText = await this.orderPuppeteer.getInputValue('#order_enduser');
    if (endUserText !== orderNr) {
      throw new Error('Failed to input orderNr to end user input');
    }

    const proffesionalSectorDropdownIsLoaded =
      await this.orderPuppeteer.checkLocation('#order_enduser', false, false);

    if (!proffesionalSectorDropdownIsLoaded) {
      throw new Error('Could not load professional sector dropdown');
    }
    await this.orderPuppeteer.dropdownSelect('#order_opt_9', 'Unknown');
    await this.orderPuppeteer.input('#order_function', 'N/A');
    await this.orderPuppeteer.dropdownSelect(
      '#order_opt_26',
      'Safety shoe with protective toecap (EN-ISO 20345:2011)',
    );

    await this.waitClick(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
    );

    const isModelLoaded = await this.orderPuppeteer.checkLocation(
      '#page-content-wrapper > div > div > div > div.col-md-7 > div',
      false,
      false,
    );

    if (!isModelLoaded) {
      console.log('Clicked next again');
      await this.waitClick(
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      );
    }
  }

  private async inputModel(model: string, size: string, width: string) {
    const isModelLoaded = await this.orderPuppeteer.checkLocation(
      '#page-content-wrapper > div > div > div > div.col-md-7 > div',
      false,
      false,
    );

    await this.orderPuppeteer.wait(
      '#page-content-wrapper > div > div > div > div.col-md-7 > div',
      5000,
    );

    if (!isModelLoaded) {
      throw new Error('failed to load model page');
    }
    const models: string[] = await this.orderPuppeteer.getModelText(
      'div.col-md-7 > div.row > div > h3',
    );
    console.log(models);

    if (!models) {
      throw new Error('could not find models');
    }

    console.log(model);
    for (let i = 0; i < models.length; i++) {
      if (model.includes(models[i])) {
        await this.waitClick(
          `div.col-md-7 > div.row > div:nth-child(${i + 1}) > h3`,
        );
      }
    }

    /* for (const m of models) {
      if (model.includes(m)) {
        console.log(m);
        await this.orderPuppeteer.selectByTexts(
          'div.col-md-7 > div.row > div > h3',
          m,
        );
        break;
      }
    }*/
    const sizeSelectorLoaded = await this.orderPuppeteer.checkLocation(
      '#order_opt_15',
      false,
      false,
    );

    if (!sizeSelectorLoaded) {
      throw new Error('Page failed to load shoe size selector');
    }

    await this.orderPuppeteer.dropdownSelect('#order_opt_15', size);

    const splitter = width.split('-');
    if (splitter.length < 2) {
      throw new Error('invalied width');
    }

    const widthSelectorLoaded = await this.orderPuppeteer.checkLocation(
      '#order_opt_16',
      false,
      false,
    );

    if (!widthSelectorLoaded) {
      throw new Error('Page failed to load shoe width selector');
    }

    await this.orderPuppeteer.dropdownSelect(
      '#order_opt_16',
      'w' + splitter[1],
    );

    await this.waitClick(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
    );

    const isSupplementlLoaded = await this.orderPuppeteer.checkLocation(
      '#order_info_14',
      false,
      true,
    );

    console.log(isSupplementlLoaded);

    if (!isSupplementlLoaded) {
      console.log('Clicked next again');
      await this.waitClick(
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      );
    }
  }

  async supplement(insole: boolean) {
    const isSupplementlLoaded = await this.orderPuppeteer.checkLocation(
      '#order_info_14',
      false,
      true,
    );

    if (!isSupplementlLoaded) {
      throw new Error('Could not get to supplement page');
    }

    if (insole) {
      await this.orderPuppeteer.wait('#order_info_14');
      await this.orderPuppeteer.click('#order_info_14', true);

      const isSupplementlLoaded = await this.orderPuppeteer.checkLocation(
        '#choice_224',
        false,
        true,
      );

      if (!isSupplementlLoaded) {
        throw new Error('Could not get to orthotic/inlay modal');
      }

      if (isSupplementlLoaded) {
        console.log('nani');
      }

      await this.orderPuppeteer.wait(null, 5000);
      await this.orderPuppeteer.wait('#choice_224');
      await this.orderPuppeteer.click('#choice_224', false);
    }
    //this.orderPuppeteer.click('#wizard_button_save')
  }

  async waitClick(selector: string) {
    await this.orderPuppeteer.wait(selector);
    await this.orderPuppeteer.click(selector, true);
  }

  async inputAddress(
    deliveryAddress: string[],
    orderNr: string,
    customerName: string,
  ) {
    await this.orderPuppeteer.wait('#order_afladr_form');
    await this.orderPuppeteer.input('#order_afladr_name', customerName);

    const address = deliveryAddress[0].split(' ');

    await this.orderPuppeteer.input('#order_afladr_street', address[0]);

    await this.orderPuppeteer.input('#order_afladr_nr', address[1]);

    const postalCodeandCity = deliveryAddress[1].split(' ');

    await this.orderPuppeteer.input('#order_afladr_zip', postalCodeandCity[0]);

    await this.orderPuppeteer.input(
      '#order_afladr_place',
      postalCodeandCity[1],
    );

    const country = deliveryAddress[2].split(' ');

    await this.orderPuppeteer.input('#order_afladr_zip', postalCodeandCity[0]);
  }

  async handleOrderCompletion(dev: boolean): Promise<string> {
    this.orderPuppeteer.click('#wizard_button_save', true);

  }

  async handleAllocations(
    orders: OrderLists,
    username: string,
    password: string,
  ): Promise<string> {
    return Promise.resolve('');
  }
}
