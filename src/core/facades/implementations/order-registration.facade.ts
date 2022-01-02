import { OrderRegistrationFacadeInterface } from '../interfaces/order-registration-facade.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../domain.services/puppeteer-utility.interface';
import { STSOrderModel } from '../../models/sts-order.model';
import { OrderTypeEnum } from '../../enums/type.enum';
import { LoginDto } from '../../../ui.api/dto/user/login.dto';
import { INSSOrderModel } from '../../models/ins-s-order.model';
import { CreateLogDto } from '../../../ui.api/dto/log/logEntry/create-log.dto';
import { ProcessStepEnum } from '../../enums/processStep.enum';
import { OrderList } from '../../models/order-list';
import { OrderInfoModel } from '../../models/order-info.model';
import { OrderWithLogs } from '../../models/orderWithLogs';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import {
  OrderRegistrationInterface,
  orderRegistrationInterfaceProvider,
} from '../../application.services/interfaces/order-registration/order/order-registration.interface';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../application.services/interfaces/puppeteer/puppeteer-service.Interface';
import {
  STSInterface,
  STSInterfaceProvider,
} from '../../application.services/interfaces/order-registration/sts/STS.interface';
import {
  INSSInterface,
  iNSSInterfaceProvider,
} from '../../application.services/interfaces/order-registration/ins-s/INSS.interface';

@Injectable()
export class OrderRegistrationFacade
  implements OrderRegistrationFacadeInterface
{
  constructor(
    @Inject(puppeteerUtilityInterfaceProvider)
    private readonly puppeteerUtil: PuppeteerUtilityInterface,
    @Inject(orderRegistrationInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationInterface,
    @Inject(puppeteerServiceInterfaceProvider)
    private readonly puppeteerService: PuppeteerServiceInterface,
    @Inject(STSInterfaceProvider)
    private readonly stsService: STSInterface,
    @Inject(iNSSInterfaceProvider)
    private readonly inssService: INSSInterface,
    private configService: ConfigService,
  ) {}

  /**
   * Takes a order-registration-number and then calls the appropriate puppeteer methods,
   * in order-registration to retrieve and return a complete list of order-registration objects with all the correct data.
   * @param orderNumber
   * @param login
   */
  async getOrderInfo(orderNumber: string, login: LoginDto): Promise<OrderList> {
    let STSOrder: STSOrderModel = null;
    let INSOrder: INSSOrderModel = null;
    const OSAOrder = null;
    const SOSOrder = null;
    const logEntries: Array<CreateLogDto> = [];
    try {
      await this.puppeteerService.startPuppeteer('https://www.google.com/');
      await this.orderRegistrationService.handleOrtowearNavigation(
        login.username,
        login.password,
      );
      await this.puppeteerService.goToURL(
        this.configService.get('ORTOWEARURL') + '/administration/orders/open',
      );
    } catch (err) {
      const log: CreateLogDto = {
        error: { errorMessage: err.message },
        status: false,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: new Date(),
        order: {
          orderNr: orderNumber,
          completed: false,
        },
      };
      logEntries.push(log);
      return {
        STSOrder: STSOrder,
        INSOrder: INSOrder,
        logEntries: logEntries,
      };
    }
    try {
      if (orderNumber.length < 1) {
        throw new Error('order-registration number is blank');
      }

      const targetAndSelector =
        await this.orderRegistrationService.getTableInfo(orderNumber);

      const orderType = targetAndSelector.type;

      const type = await this.orderRegistrationService.getOrderType(orderType);
      let order;
      switch (type) {
        case OrderTypeEnum.STS:
          order = await this.stsService.handleSTSOrder(
            orderNumber,
            targetAndSelector.selector,
          );
          order.insole = await this.orderRegistrationService.checkForInsole();
          STSOrder = order;
          break;
        case OrderTypeEnum.INSS:
          order = await this.inssService.handleINSSOrder(
            orderNumber,
            targetAndSelector.selector,
          );
          INSOrder = order;
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
      await this.puppeteerService.goToURL(
        this.configService.get('ORTOWEARURL') + 'administration/ordersAdmin/',
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
    }
    await this.puppeteerService.stopPuppeteer();
    return {
      STSOrder: STSOrder,
      INSOrder: INSOrder,
      logEntries: logEntries,
    };
  }

  /**
   * handles creation of the order on ortowear
   * @param orders
   * @param username
   * @param password
   * @param dev
   * @param completeOrder
   */
  async createOrder(
    orders: OrderList,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderList> {
    let STSOrder: STSOrderModel = null;
    let INSOrder: INSSOrderModel = null;
    const OSAOrder = null;
    const SOSOrder = null;
    try {
      await this.puppeteerUtil.start(false, 'https://www.google.com/');
      await this.orderRegistrationService.handleNeskridNavigation(
        username,
        password,
      );
      await this.puppeteerUtil.click(
        '#page-content-wrapper > div.container-fluid > div:nth-child(2) > div.col-lg-3.col-md-4.col-sm-6.col-xs-6 > section > div.panel-body > div > div > div',
        true,
        true,
      );

      await this.puppeteerUtil.clickRadioButton(
        '#sitebody > div.cc-window.cc-banner.cc-type-opt-out.cc-theme-classic.cc-bottom > div > a.cc-btn.cc-dismiss',
      );
      console.log(orders.STSOrder);
    } catch (err) {
      let orderNr;

      if (orders.STSOrder) {
        orderNr = orders.STSOrder.orderNr;
      }

      if (orders.INSOrder) {
        orderNr = orders.INSOrder.orderNr;
      }

      const log: CreateLogDto = {
        error: { errorMessage: err.message },
        status: false,
        process: ProcessStepEnum.REGISTERORDER,
        timestamp: new Date(),
        order: {
          orderNr: orderNr,
          completed: false,
        },
      };
      orders.logEntries.push(log);
      return {
        STSOrder: STSOrder,
        INSOrder: INSOrder,
        logEntries: orders.logEntries,
      };
    }
    if (orders.STSOrder) {
      try {
        await this.puppeteerUtil.click(
          '#page-content-wrapper > div > div > div > section > div.panel-body > div > div:nth-child(3) > div',
          true,
          true,
        );

        await this.orderRegistrationService.inputOrderInformation(
          orders.STSOrder.orderNr,
          orders.STSOrder.deliveryAddress,
          orders.STSOrder.insole,
          orders.STSOrder.EU,
          orders.STSOrder.customerName,
        );
        const isInUsageEnvoPage = await this.puppeteerUtil.checkLocation(
          '#page-content-wrapper > div > div > h1',
          false,
          false,
        );

        if (!isInUsageEnvoPage) {
          throw new Error('Could not load usage envoirment page.');
        }

        await this.stsService.inputStsUsageEnvironment(orders.STSOrder.orderNr);
        await this.stsService.inputStsModel(
          orders.STSOrder.model,
          orders.STSOrder.sizeL,
          orders.STSOrder.widthL,
        );
        await this.stsService.supplement(orders.STSOrder.insole, dev);
        const dateString =
          await this.orderRegistrationService.handleOrderCompletion(
            dev,
            completeOrder,
          );
        if (!dateString) {
          throw new Error('failed to get delivery date: ' + dateString);
        }

        orders.STSOrder.timeOfDelivery =
          this.orderRegistrationService.formatDeliveryDate(dateString);
        if (orders.STSOrder.timeOfDelivery.toString() === 'Invalid Date') {
          throw new Error('Could not get the time of delivery');
        }
        console.log('d:    ' + orders.STSOrder.timeOfDelivery);
        const log: CreateLogDto = {
          status: true,
          process: ProcessStepEnum.REGISTERORDER,
          timestamp: new Date(),
          order: { orderNr: orders.STSOrder.orderNr, completed: false },
        };
        STSOrder = orders.STSOrder;
        orders.logEntries.push(log);
        await this.puppeteerService.goToURL(
          'https://www.neskrid.com/plugins/neskrid/myneskrid_new.aspx',
        );
      } catch (err) {
        const log: CreateLogDto = {
          error: { errorMessage: err.message },
          status: false,
          process: ProcessStepEnum.REGISTERORDER,
          timestamp: new Date(),
          order: { orderNr: orders.STSOrder.orderNr, completed: false },
        };
        orders.logEntries.push(log);
        await this.puppeteerService.goToURL(
          'https://www.neskrid.com/plugins/neskrid/myneskrid_new.aspx',
        );
      }
    }

    if (orders.INSOrder) {
      try {
        await this.puppeteerUtil.click(
          '#page-content-wrapper > div > div > div > section > div.panel-body > div > div:nth-child(4) > div',
          true,
          true,
        );
        await this.orderRegistrationService.inputOrderInformation(
          orders.INSOrder.orderNr,
          orders.INSOrder.deliveryAddress,
          true,
          orders.INSOrder.EU,
          orders.INSOrder.customerName,
        );

        const isInUsageEnvoPage = await this.puppeteerUtil.checkLocation(
          '#page-content-wrapper > div > div > h1',
          false,
          false,
        );

        if (!isInUsageEnvoPage) {
          throw new Error('Could not load usage environment page.');
        }
        await this.inssService.inputInssUsageEnvironment(orders.INSOrder);

        await this.inssService.inputInssModel(orders.INSOrder);

        await this.inssService.orthotics();

        await this.inssService.confirmation();

        const dateString =
          await this.orderRegistrationService.handleOrderCompletion(
            dev,
            completeOrder,
          );

        if (!dateString) {
          throw new Error('Failed to get delivery date! ' + dateString);
        }

        orders.INSOrder.timeOfDelivery =
          this.orderRegistrationService.formatDeliveryDate(dateString);

        if (orders.INSOrder.timeOfDelivery.toString() === 'Invalid Date') {
          throw new Error('Could not find delivery date. Date is invalid!');
        }

        const log: CreateLogDto = {
          status: true,
          process: ProcessStepEnum.REGISTERORDER,
          timestamp: new Date(),
          order: { orderNr: orders.INSOrder.orderNr, completed: false },
        };

        INSOrder = orders.INSOrder;
        orders.logEntries.push(log);

        await this.puppeteerService.goToURL(
          'https://www.neskrid.com/plugins/neskrid/myneskrid_new.aspx',
        );
      } catch (err) {
        const log: CreateLogDto = {
          error: { errorMessage: err.message },
          status: false,
          process: ProcessStepEnum.REGISTERORDER,
          timestamp: new Date(),
          order: { orderNr: orders.INSOrder.orderNr, completed: false },
        };
        orders.logEntries.push(log);
        await this.puppeteerService.goToURL(
          'https://www.neskrid.com/plugins/neskrid/myneskrid_new.aspx',
        );
      }
    }
    await this.puppeteerService.stopPuppeteer();
    return {
      STSOrder: STSOrder,
      INSOrder: INSOrder,
      logEntries: orders.logEntries,
    };
  }

  /**
   * handles allocating the orders on ortowear
   * @param orderWithLogs
   * @param username
   * @param password
   * @param dev
   * @param completeOrder
   * @param dateBuffer
   */
  async handleAllocations(
    orderWithLogs: OrderWithLogs,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
    dateBuffer: number,
  ): Promise<OrderWithLogs> {
    const order: OrderInfoModel = orderWithLogs.order;
    try {
      await this.puppeteerService.startPuppeteer('https://www.google.com/');
      await this.orderRegistrationService.handleOrtowearNavigation(
        username,
        password,
      );
      await this.puppeteerService.goToURL(
        this.configService.get('ORTOWEARURL') + '/administration/orders/open',
      );
    } catch (err) {
      const log: CreateLogDto = {
        error: { errorMessage: err.message },
        status: false,
        process: ProcessStepEnum.ALOCATEORDER,
        timestamp: new Date(),
        order: {
          orderNr: orderWithLogs.order.orderNr,
          completed: false,
        },
      };
      orderWithLogs.logEntries.push(log);
      orderWithLogs.order = undefined;
      return orderWithLogs;
    }

    try {
      const targetAndSelector =
        await this.puppeteerUtil.getTableTargetandSelector(
          orderWithLogs.order.orderNr,
        );

      await this.puppeteerUtil.click(targetAndSelector.selector, true, true);
      await this.puppeteerUtil.click(
        '#topBtns > div > div > button:nth-child(4)',
        true,
        true,
      );

      let isInAlocation = await this.puppeteerUtil.checkLocation(
        '#delivery',
        false,
        false,
      );

      if (!isInAlocation) {
        await this.puppeteerUtil.click(
          '#topBtns > div > div > button:nth-child(4)',
          true,
          true,
        );
      }

      isInAlocation = await this.puppeteerUtil.checkLocation(
        '#delivery',
        false,
        false,
      );

      if (!isInAlocation) {
        throw new Error('Failed to allocate, order is already allocated');
      }
      // If statement where you check if orderWithLogs.daysToAdd is < 0
      // then instead of the below if statement you simply add the amount of days
      if (dateBuffer > 0) {
        let luxDate = DateTime.fromJSDate(order.timeOfDelivery);

        luxDate = luxDate.plus({ days: dateBuffer });

        order.timeOfDelivery = luxDate.toJSDate();

        console.log(order.timeOfDelivery);
      } else {
        if (orderWithLogs.insole) {
          if (
            order.timeOfDelivery.getDay() == 3 ||
            order.timeOfDelivery.getDay() == 4
          ) {
            order.timeOfDelivery =
              this.orderRegistrationService.getNextDayOfWeek(
                order.timeOfDelivery,
                5,
              );
          } else {
            order.timeOfDelivery =
              this.orderRegistrationService.getNextDayOfWeek(
                order.timeOfDelivery,
                3,
              );
          }
        }
      }

      await this.puppeteerUtil.click('#delivery', true, true);

      const isDatepicker = await this.puppeteerUtil.checkLocation(
        '#ui-datepicker-div',
        false,
        true,
      );

      if (!isDatepicker) {
        await this.puppeteerService.tryAgain(
          '#ui-datepicker-div',
          '#delivery',
          0,
        );
      }

      const ortowearYear = await this.puppeteerService.getElementText(
        '#ui-datepicker-div > div > div > span.ui-datepicker-year',
      );

      const numberOrtowearYear = Number.parseInt(ortowearYear);

      const yearCheck = await this.orderRegistrationService.adjustYear(
        order.timeOfDelivery.getFullYear(),
        numberOrtowearYear,
        0,
      );

      if (!yearCheck) {
        throw new Error('Failed to set year');
      }

      const ortowearMonth = await this.puppeteerService.getElementText(
        '#ui-datepicker-div > div > div > span.ui-datepicker-month',
      );

      const monthCheck = await this.orderRegistrationService.adjustMonth(
        order.timeOfDelivery,
        ortowearMonth,
        0,
      );

      if (!monthCheck) {
        throw new Error('Failed to set month');
      }

      const dateSelector = await this.puppeteerUtil.selectDate(
        order.timeOfDelivery.getDate(),
      );

      if (!dateSelector) {
        throw new Error('Failed to get date selector');
      }

      await this.puppeteerUtil.click(dateSelector, true, true);

      const formatedOrderDate = `${order.timeOfDelivery.toLocaleDateString(
        'default',
        { day: '2-digit' },
      )}-${order.timeOfDelivery.toLocaleDateString('default', {
        month: '2-digit',
      })}-${order.timeOfDelivery.getFullYear()}`;

      const inputdate = await this.puppeteerUtil.getInputValue('#delivery');
      console.log(inputdate);

      if (formatedOrderDate != inputdate) {
        throw new Error(
          `Failed to input delivery date: order date: ${formatedOrderDate}, input date: ${inputdate}`,
        );
      }

      if (order.EU) {
        await this.puppeteerUtil.selectDropdownByValue('#return_to', 'client');

        const selectedValue = await this.puppeteerUtil.getSelectedValue(
          '#return_to',
        );

        if (selectedValue != 'client') {
          throw new Error('Failed to select return destination: client');
        }
      } else {
        const selectedValue = await this.puppeteerUtil.getSelectedValue(
          '#return_to',
        );

        if (selectedValue != 'sender') {
          await this.puppeteerUtil.selectDropdownByValue(
            '#return_to',
            'sender',
          );
        }

        if (selectedValue != 'sender') {
          throw new Error('Failed to select return destination: sender');
        }
      }

      if (orderWithLogs.insole) {
        const checkForSelect1 = await this.puppeteerUtil.checkLocation(
          '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
          false,
          true,
        );

        const checkForSelect2 = await this.puppeteerUtil.checkLocation(
          '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
          false,
          true,
        );

        if (checkForSelect1) {
          await this.puppeteerUtil.selectDropdownByValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
            'AVSI3STZSN3F7GRV',
          );

          const selectedValue = await this.puppeteerUtil.getSelectedValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
          );

          if (selectedValue != 'AVSI3STZSN3F7GRV') {
            throw new Error('Failed to select supplier: ' + selectedValue);
          }
        } else if (checkForSelect2) {
          await this.puppeteerUtil.selectDropdownByValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
            'AVSI3STZSN3F7GRV',
          );

          const selectedValue = await this.puppeteerUtil.getSelectedValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
          );

          if (selectedValue != 'AVSI3STZSN3F7GRV') {
            throw new Error('Failed to select supplier: ' + selectedValue);
          }
        } else {
          throw new Error('Could not find supplier dropdown');
        }
      } else {
        const checkForSelect1 = await this.puppeteerUtil.checkLocation(
          '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
          false,
          true,
        );

        const checkForSelect2 = await this.puppeteerUtil.checkLocation(
          '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
          false,
          true,
        );

        if (checkForSelect1) {
          await this.puppeteerUtil.selectDropdownByValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
            '1x20e4UK1Nfp3S6t',
          );

          let selectedValue = await this.puppeteerUtil.getSelectedValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
          );

          if (selectedValue != '1x20e4UK1Nfp3S6t') {
            await this.puppeteerUtil.selectDropdownByValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
              '1x20e4UK1Nfp3S6t',
            );
          }

          selectedValue = await this.puppeteerUtil.getSelectedValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(3) > div.col-3 > select',
          );

          if (selectedValue != '1x20e4UK1Nfp3S6t') {
            throw new Error('Failed to select supplier: ' + selectedValue);
          }
        } else if (checkForSelect2) {
          await this.puppeteerUtil.selectDropdownByValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
            '1x20e4UK1Nfp3S6t',
          );

          let selectedValue = await this.puppeteerUtil.getSelectedValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
          );

          if (selectedValue != '1x20e4UK1Nfp3S6t') {
            await this.puppeteerUtil.selectDropdownByValue(
              '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
              '1x20e4UK1Nfp3S6t',
            );
          }

          selectedValue = await this.puppeteerUtil.getSelectedValue(
            '#default > form > div.box-body.row > div.col-6 > div:nth-child(4) > div.col-3 > select',
          );

          if (selectedValue != '1x20e4UK1Nfp3S6t') {
            throw new Error('Failed to select supplier: ' + selectedValue);
          }
        } else {
          throw new Error('Could not find supplier dropdown');
        }
      }

      if (completeOrder) {
        await this.puppeteerUtil.click('button[type=submit]', true, true);
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
      orderWithLogs.logEntries.push(log);
      await this.puppeteerService.goToURL(
        this.configService.get('ORTOWEARURL') + 'administration/ordersAdmin/',
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
      orderWithLogs.logEntries.push(log);
      orderWithLogs.order = undefined;
      await this.puppeteerService.goToURL(
        this.configService.get('ORTOWEARURL') + 'administration/ordersAdmin/',
      );
    }

    await this.puppeteerService.stopPuppeteer();
    return orderWithLogs;
  }
}
