import { OrderRegistrationInterface } from '../interfaces/order-registration.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../domain.services/order-puppeteer.interface';
import { STSOrderModel } from '../models/sts-order.model';
import { OrderTypeEnum } from '../enums/type.enum';
import { LoginDto } from '../../ui.api/dto/user/login.dto';
import { INSSOrderModel } from '../models/ins-s-order.model';
import { OrderLists } from '../models/order-lists';
import { LogEntryDto } from '../../ui.api/dto/log/logEntry/log-entry.dto';
import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';
import { ProcessStepEnum } from '../enums/processStep.enum';
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils';

@Injectable()
export class OrderRegistrationService implements OrderRegistrationInterface {
  constructor(
    @Inject(orderPuppeteerInterfaceProvider)
    private readonly orderPuppeteer: OrderPuppeteerInterface,
  ) {}

  /**
   * Takes a list of order-registration-numbers and then calls the appropriate puppeteer methods,
   * in order-registration to retrieve and return a complete list og order-registration object with all the correct data.
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
    const logEntries: Array<CreateLogDto> = [];
    try {
      await this.startPuppeteer('https://www.google.com/');
      await this.handleOrtowearNavigation(login.username, login.password);
      await this.goToURL(
        'https://order.ortowear.com/administration/ordersAdmin/',
      );
    } catch (err) {
      const log: CreateLogDto = {
        error: { errorMessage: err.message },
        status: false,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: new Date(),
        order: {
          orderNr: 'No Order number: failed to navigate to ortowear',
          completed: false,
        },
      };
      logEntries.push(log);
      return {
        STSOrders: STSOrders,
        INSOrders: INSOrders,
        logEntries: logEntries,
      };
    }
    for (const orderNumber of orderNumbers) {
      try {
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
            throw new Error('could not determine order-registration type');
        }
        const log: CreateLogDto = {
          status: true,
          process: ProcessStepEnum.GETORDERINFO,
          timestamp: new Date(),
          order: { orderNr: orderNumber, completed: false },
        };
        logEntries.push(log);
        await this.goToURL(
          'https://order.ortowear.com/administration/ordersAdmin/',
        );
      } catch (err) {
        const log: CreateLogDto = {
          error: { errorMessage: err.message },
          status: false,
          process: ProcessStepEnum.GETORDERINFO,
          timestamp: new Date(),
          order: { orderNr: orderNumber, completed: false },
        };
        logEntries.push(log);
        await this.goToURL(
          'https://order.ortowear.com/administration/ordersAdmin/',
        );
      }
    }
    await this.stopPuppeteer();
    return {
      STSOrders: STSOrders,
      INSOrders: INSOrders,
      logEntries: logEntries,
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

    await this.goToURL('https://order.ortowear.com/');

    await this.orderPuppeteer.loginOrtowear(username, password);

    const checklocation = await this.orderPuppeteer.checkLocation(
      'div.home-main:nth-child(2) > div:nth-child(1)',
      false,
      true,
    );

    if (!checklocation) {
      if (
        await this.orderPuppeteer.checkLocation(
          '#loginForm > div.form-group.has-error > span > strong',
          false,
          true,
        )
      ) {
        const ortowearError = await this.getElementText(
          '#loginForm > div.form-group.has-error > span > strong',
        );
        throw new Error(
          'Failed to login, ortowear gave this error:' + ortowearError,
        );
      } else {
        throw new Error('Failed to login, but ortowear didnt display error');
      }
    }

    const myPageURL = 'https://order.ortowear.com/my_page';
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
   * gets order-registration type for the different order-registration numbers given
   * @private
   * @param orderNumber
   */
  async getOrderType(orderNumber: string): Promise<OrderTypeEnum> {
    if (orderNumber.length < 1) {
      throw new Error('order-registration number is blank');
    }

    const targetAndSelector =
      await this.orderPuppeteer.getTableTargetandSelector(orderNumber);

    const orderType = targetAndSelector.type;

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
        throw new Error('could not find order-registration');

      default:
        throw new Error('invalid order-registration type');
    }
  }

  /**
   * get order-registration information for an STS order-registration
   * @param orderNumber
   * @private
   */
  async handleSTSOrder(orderNumber: string): Promise<STSOrderModel> {
    if (orderNumber.length < 1) {
      throw new Error('missing order-registration number');
    }

    const targetAndSelector =
      await this.orderPuppeteer.getTableTargetandSelector(orderNumber);

    await this.waitClick(targetAndSelector.selector);
    await this.waitClick(
      '#topBtns > div > div > button.btn.btn-sm.btn-warning',
    );

    const check = await this.orderPuppeteer.checkLocation(
      'body > div.wrapper > div.content-wrapper > section.content-header > h1',
      false,
      false,
    );

    if (!check) {
      throw new Error('Could not find order-registration page');
    }

    //Enable this in production.
    /*if (!(await this.orderPuppeteer.checkLocation('#edit_order', false))) {
      throw new Error('This order-registration is delivered so it cannot be allocated');
    }*/

    const order: STSOrderModel = await this.orderPuppeteer.readSTSOrder(
      orderNumber,
    );
    if (!order) {
      throw new Error('failed getting order-registration information');
    } else if (!order.toeCap || order.toeCap == '') {
      throw new Error('failed getting toe cap');
    } else if (order.orderNr != orderNumber) {
      throw new Error('failed getting correct order-registration');
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
   * check if an order-registration has an insole
   * @private
   */
  async checkForInsole(): Promise<boolean> {
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
      throw new Error(
        'invalid order-registration, EMMA order-registration is not supported',
      );
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

  async createOrder(
    orders: OrderLists,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderLists> {
    const STSOrders: STSOrderModel[] = [];
    const INSOrders: INSSOrderModel[] = [];
    const OSAOrders: [] = [];
    const SOSOrders: [] = [];
    try {
      await this.orderPuppeteer.start(false, 'https://www.google.com/');
      await this.handleNeskridNavigation(username, password);
      await this.waitClick(
        '#page-content-wrapper > div.container-fluid > div:nth-child(2) > div.col-lg-3.col-md-4.col-sm-6.col-xs-6 > section > div.panel-body > div > div > div',
      );
      await this.waitClick(
        '#sitebody > div.cc-window.cc-banner.cc-type-opt-out.cc-theme-classic.cc-bottom > div > a.cc-btn.cc-dismiss',
      );
      console.log(orders.STSOrders.length);
    } catch (err) {
      const log: CreateLogDto = {
        error: { errorMessage: err.message },
        status: false,
        process: ProcessStepEnum.REGISTERORDER,
        timestamp: new Date(),
        order: {
          orderNr: 'No Order number: failed to navigate to neskrid',
          completed: false,
        },
      };
      orders.logEntries.push(log);
      return {
        STSOrders: STSOrders,
        INSOrders: INSOrders,
        logEntries: orders.logEntries,
      };
    }
    if (orders.STSOrders.length > 0) {
      for (const order of orders.STSOrders) {
        try {
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
          await this.supplement(order.insole, dev);
          const dateString = await this.handleOrderCompletion(
            dev,
            completeOrder,
          );
          if (!dateString) {
            throw new Error('failed to get delivery date: ' + dateString);
          }

          order.timeOfDelivery = this.formatDeliveryDate(dateString);
          if (order.timeOfDelivery.toString() === 'Invalid Date') {
            throw new Error('Could not get the time of delivery');
          }
          console.log('d:    ' + order.timeOfDelivery);
          const log: CreateLogDto = {
            status: true,
            process: ProcessStepEnum.REGISTERORDER,
            timestamp: new Date(),
            order: { orderNr: order.orderNr, completed: false },
          };
          STSOrders.push(order);
          orders.logEntries.push(log);
          await this.goToURL(
            'https://www.neskrid.com/plugins/neskrid/myneskrid_new.aspx',
          );
        } catch (err) {
          const log: CreateLogDto = {
            error: { errorMessage: err.message },
            status: false,
            process: ProcessStepEnum.REGISTERORDER,
            timestamp: new Date(),
            order: { orderNr: order.orderNr, completed: false },
          };
          orders.logEntries.push(log);
          await this.goToURL(
            'https://www.neskrid.com/plugins/neskrid/myneskrid_new.aspx',
          );
        }
      }
    }

    if (orders.INSOrders.length > 0) {
      return;
    }
    await this.stopPuppeteer();
    return {
      STSOrders: STSOrders,
      INSOrders: INSOrders,
      logEntries: orders.logEntries,
    };
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
      await this.tryAgain(
        '#order_enduser',
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        0,
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
    let found = false;
    for (let i = 0; i < models.length; i++) {
      if (model.includes(models[i])) {
        const selector = `div.col-md-7 > div.row > div:nth-child(${
          i + 1
        }) > h3`;

        const modelcheck = this.orderPuppeteer.checkLocation(
          selector,
          false,
          true,
        );

        if (!modelcheck) {
          throw new Error('Cannot locate model select button');
        }

        await this.orderPuppeteer.click(selector, true);

        found = true;
        const propertyValues = await this.orderPuppeteer.getCSSofElement(
          `div.col-md-7 > div.row > div:nth-child(${i + 1})`,
          'background-color',
        );
        console.log(`Property values of model: ${propertyValues}`);
      }
    }

    if (!found) {
      throw new Error('Could not find matching model for: ' + model);
    }

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
      console.log('Clicked next again: supplement');
      await this.tryAgain(
        '#order_info_14',
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        0,
      );
    }
  }

  async supplement(insole: boolean, dev: boolean) {
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

    if (!dev) {
      await this.waitClick('#wizard_button_save');
    }
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
        `Date is : ${newDate.getDate()}/${
          newDate.getMonth() + 1
        }/${newDate.getFullYear()}`,
      );
      return `${newDate.getDate()}/${
        newDate.getMonth() + 1
      }/${newDate.getFullYear()}`;
    }
    await this.orderPuppeteer.click('#wizard_button_save', true);
    const pageCheck = await this.orderPuppeteer.checkLocation(
      '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
      false,
      false,
    );
    if (!pageCheck) {
      await this.tryAgain(
        '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
        '#wizard_button_save',
        0,
      );
    }
    await this.orderPuppeteer.click(
      '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
      false,
    );
    const modal = await this.orderPuppeteer.checkLocation(
      '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div',
      false,
      true,
    );
    if (!modal) {
      this.tryAgain(
        '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div',
        '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-success',
        0,
      );
    }
    const dd = this.orderPuppeteer.checkLocation(
      '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > table.table.mar-bot30 > tbody > tr:nth-child(2) > td:nth-child(3)',
      false,
      true,
    );
    let deliveryDate;
    if (dd) {
      await this.orderPuppeteer.wait(null, 2000);
      deliveryDate = await this.orderPuppeteer.readSelectorText(
        '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > table.table.mar-bot30 > tbody > tr:nth-child(2) > td:nth-child(3)',
      );
    } else {
      throw new Error('failed to get deliveryDate');
    }

    if (completeOrder) {
      // confirm btn
      await this.orderPuppeteer.click(
        '#choiceinvalid-footer > button.btn.btn-success',
        true,
      );
      await this.orderPuppeteer.wait(null, 5000);
    } else {
      //cancel btn
      await this.orderPuppeteer.click(
        '#choiceinvalid-footer > button.btn.btn-default',
        true,
      );
      await this.waitClick(
        '#page-content-wrapper > div > div:nth-child(3) > div > section > div.panel-footer > a.btn.btn-danger',
      );
    }

    return deliveryDate;
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

  async handleAllocations(
    orders: OrderLists,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderLists> {
    const STSOrders: STSOrderModel[] = [];
    const INSOrders: INSSOrderModel[] = [];
    const OSAOrders: [] = [];
    const SOSOrders: [] = [];
    try {
      await this.startPuppeteer('https://www.google.com/');
      await this.handleOrtowearNavigation(username, password);
      await this.goToURL(
        'https://order.ortowear.com/administration/ordersAdmin/',
      );

      console.log(orders.STSOrders.length);
    } catch (err) {
      const log: CreateLogDto = {
        error: { errorMessage: err.message },
        status: false,
        process: ProcessStepEnum.ALOCATEORDER,
        timestamp: new Date(),
        order: {
          orderNr: 'No Order number: failed to navigate to ortowear',
          completed: false,
        },
      };
      orders.logEntries.push(log);
      return {
        STSOrders: STSOrders,
        INSOrders: INSOrders,
        logEntries: orders.logEntries,
      };
    }
    if (orders.STSOrders.length > 0) {
      for (const order of orders.STSOrders) {
        try {
          const targetAndSelector =
            await this.orderPuppeteer.getTableTargetandSelector(order.orderNr);

          await this.waitClick(targetAndSelector.selector);
          await this.waitClick('#topBtns > div > div > button:nth-child(4)');

          const isInAlocation = this.orderPuppeteer.checkLocation(
            '#delivery',
            false,
            false,
          );

          if (!isInAlocation) {
            await this.tryAgain(
              '#delivery',
              '#topBtns > div > div > button:nth-child(4)',
              0,
            );
          }

          if (order.insole) {
            if (
              order.timeOfDelivery.getDay() == 3 ||
              order.timeOfDelivery.getDay() == 4
            ) {
              order.timeOfDelivery = this.getNextDayOfWeek(
                order.timeOfDelivery,
                5,
              );
            } else {
              order.timeOfDelivery = this.getNextDayOfWeek(
                order.timeOfDelivery,
                3,
              );
            }
          }

          await this.waitClick('#delivery');

          const isDatepicker = await this.orderPuppeteer.checkLocation(
            '#ui-datepicker-div',
            false,
            true,
          );

          if (!isDatepicker) {
            await this.tryAgain('#ui-datepicker-div', '#delivery', 0);
          }

          const ortowearYear = await this.getElementText(
            '#ui-datepicker-div > div > div > span.ui-datepicker-year',
          );

          const numberOrtowearYear = Number.parseInt(ortowearYear);

          const yearCheck = await this.adjustYear(
            order.timeOfDelivery.getFullYear(),
            numberOrtowearYear,
            0,
          );

          if (!yearCheck) {
            throw new Error('Failed to set year');
          }

          const ortowearMonth = await this.getElementText(
            '#ui-datepicker-div > div > div > span.ui-datepicker-month',
          );

          const monthCheck = await this.adjustMonth(
            order.timeOfDelivery,
            ortowearMonth,
            0,
          );

          if (!monthCheck) {
            throw new Error('Failed to set month');
          }

          const dateSelector = await this.orderPuppeteer.selectDate(
            order.timeOfDelivery.getDate(),
          );

          if (!dateSelector) {
            throw new Error('Failed to get date selector');
          }

          await this.waitClick(dateSelector);

          const formatedOrderDate = `${order.timeOfDelivery.toLocaleDateString(
            'default',
            { day: '2-digit' },
          )}-${order.timeOfDelivery.toLocaleDateString('default', {
            month: '2-digit',
          })}-${order.timeOfDelivery.getFullYear()}`;

          const inputdate = await this.orderPuppeteer.getInputValue(
            '#delivery',
          );
          console.log(inputdate);

          if (formatedOrderDate != inputdate) {
            throw new Error(
              `Failed to input delivery date: order date: ${formatedOrderDate}, input date: ${inputdate}`,
            );
          }

          if (!order.EU) {
            await this.orderPuppeteer.selectDropdownByValue(
              '#return_to',
              'client',
            );

            const selectedValue = await this.orderPuppeteer.getSelectedValue(
              '#return_to',
            );

            if (selectedValue != 'client') {
              throw new Error('Failed to select return destination: client');
            }
          } else {
            const selectedValue = await this.orderPuppeteer.getSelectedValue(
              '#return_to',
            );

            if (selectedValue != 'sender') {
              await this.orderPuppeteer.selectDropdownByValue(
                '#return_to',
                'sender',
              );
            }

            if (selectedValue != 'sender') {
              throw new Error('Failed to select return destination: sender');
            }
          }

          if (order.insole) {
            await this.orderPuppeteer.selectDropdownByValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
              'AVSI3STZSN3F7GRV',
            );

            const selectedValue = await this.orderPuppeteer.getSelectedValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
            );

            if (selectedValue != 'AVSI3STZSN3F7GRV') {
              throw new Error('Failed to select supplier: ' + selectedValue);
            }
          } else {
            await this.orderPuppeteer.selectDropdownByValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
              '1x20e4UK1Nfp3S6t',
            );

            let selectedValue = await this.orderPuppeteer.getSelectedValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
            );

            if (selectedValue != '1x20e4UK1Nfp3S6t') {
              await this.orderPuppeteer.selectDropdownByValue(
                '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
                '1x20e4UK1Nfp3S6t',
              );
            }

            selectedValue = await this.orderPuppeteer.getSelectedValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
            );

            if (selectedValue != '1x20e4UK1Nfp3S6t') {
              throw new Error('Failed to select supplier: ' + selectedValue);
            }
          }

          if (completeOrder) {
            await this.waitClick(
              '#default > form > div.box-footer > div > button.btn.btn-ow.pull-right',
            );
            await this.orderPuppeteer.wait(null, 5000);
          }
          const log: CreateLogDto = {
            status: true,
            process: ProcessStepEnum.ALOCATEORDER,
            timestamp: new Date(),
            order: {
              orderNr: order.orderNr,
              completed: true,
            },
          };
          STSOrders.push(order);
          orders.logEntries.push(log);
          await this.goToURL(
            'https://order.ortowear.com/administration/ordersAdmin/',
          );
        } catch (err) {
          const log: CreateLogDto = {
            error: { errorMessage: err.message },
            status: false,
            process: ProcessStepEnum.ALOCATEORDER,
            timestamp: new Date(),
            order: {
              orderNr: order.orderNr,
              completed: false,
            },
          };
          orders.logEntries.push(log);
          await this.goToURL(
            'https://order.ortowear.com/administration/ordersAdmin/',
          );
        }
      }
    }

    if (orders.INSOrders.length > 0) {
      return;
    }
    await this.stopPuppeteer();
    return {
      STSOrders: STSOrders,
      INSOrders: INSOrders,
      logEntries: orders.logEntries,
    };
  }

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
        await this.waitClick(
          '#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all',
        );
        const newYear = await this.getElementText(
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
        await this.waitClick(
          '#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all',
        );

        const newMonth = await this.getElementText(
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
      await this.waitClick(clickSelector);
      return await this.tryAgain(checkSelector, clickSelector, counter);
    }
  }

  getNextDayOfWeek(date: Date, dayOfWeek: number): Date {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error(
        'Invalid day of the week: the day of the week should be from 0-6',
      );
    }
    const resultDate = new Date(date.getTime());

    resultDate.setDate(
      date.getDate() + ((7 + dayOfWeek - date.getDay() - 1) % 7) + 2,
    );

    return resultDate;
  }

  getMonthFromString(month: string): number {
    const d = Date.parse(month + '1, 2012');
    if (!isNaN(d)) {
      return new Date(d).getMonth() + 1;
    }
    throw new Error(
      `Failed to get month from string, input was this: ${month}`,
    );
  }
}
