import { Inject, Injectable } from '@nestjs/common';
import { STSInterface } from '../../../interfaces/order-registration/sts/STS.interface';
import { STSOrderModel } from '../../../../models/sts-order.model';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../../domain.services/puppeteer-utility.interface';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../../interfaces/puppeteer/puppeteer-service.Interface';
import { OrderInfoModel } from '../../../../models/order-info.model';

@Injectable()
export class StsService implements STSInterface {
  constructor(
    @Inject(puppeteerUtilityInterfaceProvider)
    private readonly puppeteerUtil: PuppeteerUtilityInterface,
    @Inject(puppeteerServiceInterfaceProvider)
    private readonly puppeteerService: PuppeteerServiceInterface,
  ) {}

  /**
   * get order-registration information for an STS order-registration
   * @param orderNumber
   * @param selector
   * @private
   */
  async handleSTSOrder(
    orderNumber: string,
    selector: string,
  ): Promise<STSOrderModel> {
    if (selector.length < 1) {
      throw new Error('could not find selector for order in table');
    }

    await this.puppeteerUtil.click(selector, true, true);
    await this.puppeteerUtil.click(
      '#topBtns > div > div > button.btn.btn-sm.btn-warning',
      true,
      true,
    );

    const check = await this.puppeteerUtil.checkLocation(
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

    const order: OrderInfoModel = await this.puppeteerUtil.readOrder(
      orderNumber,
    );

    const stsOrder: STSOrderModel = await this.puppeteerUtil.readSTSOrder(
      order,
    );
    if (!stsOrder) {
      throw new Error('failed getting order-registration information');
    }

    if (!stsOrder.toeCap || stsOrder.toeCap == '') {
      throw new Error('failed getting toe cap');
    }

    if (stsOrder.orderNr != orderNumber) {
      throw new Error('failed getting correct order-registration');
    }

    if (!stsOrder.sole || stsOrder.sole == '') {
      throw new Error('failed getting sole');
    }

    if (
      (stsOrder.widthR || stsOrder.widthR != '') &&
      (!stsOrder.widthL || stsOrder.widthL == '')
    ) {
      stsOrder.widthL = stsOrder.widthR;
    } else if (
      (!stsOrder.widthR || stsOrder.widthR == '') &&
      (stsOrder.widthL || stsOrder.widthL != '')
    ) {
      stsOrder.widthR = stsOrder.widthL;
    } else if (
      (!stsOrder.widthR || stsOrder.widthR == '') &&
      (!stsOrder.widthL || stsOrder.widthL == '')
    ) {
      throw new Error(
        'Both widths are empty. Please amend the order entry on the site',
      );
    }

    if (
      (stsOrder.sizeR || stsOrder.sizeR != '') &&
      (!stsOrder.sizeL || stsOrder.sizeL == '')
    ) {
      stsOrder.sizeL = stsOrder.sizeR;
    } else if (
      (!stsOrder.sizeR || stsOrder.sizeR == '') &&
      (stsOrder.sizeL || stsOrder.sizeL != '')
    ) {
      stsOrder.sizeR = stsOrder.sizeL;
    } else if (
      (!stsOrder.sizeR || stsOrder.sizeR == '') &&
      (!stsOrder.sizeL || stsOrder.sizeL == '')
    ) {
      throw new Error(
        'Both sizes are empty. Please amend the order entry on the site',
      );
    }

    if (!stsOrder.model || stsOrder.model == '') {
      throw new Error('failed getting model');
    }

    if (!stsOrder.deliveryAddress || stsOrder.deliveryAddress.length < 3) {
      throw new Error('failed getting delivery address');
    }

    if (!stsOrder.customerName || stsOrder.customerName == '') {
      throw new Error('failed getting customer');
    }

    const substring = 'Norway';
    if (stsOrder.deliveryAddress.includes(substring)) {
      stsOrder.EU = false;
    }

    return stsOrder;
  }

  async inputStsModel(model: string, size: string, width: string) {
    const isModelLoaded = await this.puppeteerUtil.checkLocation(
      '#page-content-wrapper > div > div > div > div.col-md-7 > div',
      false,
      false,
    );

    await this.puppeteerUtil.wait(
      '#page-content-wrapper > div > div > div > div.col-md-7 > div',
      5000,
    );

    if (!isModelLoaded) {
      throw new Error('failed to load model page');
    }
    const models: string[] = await this.puppeteerUtil.getTextsForAll(
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

        const modelcheck = this.puppeteerUtil.checkLocation(
          selector,
          false,
          true,
        );

        if (!modelcheck) {
          throw new Error('Cannot locate model select button');
        }

        await this.puppeteerUtil.click(selector, true, true);

        found = true;
        const propertyValues = await this.puppeteerUtil.getCSSofElement(
          `div.col-md-7 > div.row > div:nth-child(${i + 1})`,
          'background-color',
        );
        console.log(`Property values of model: ${propertyValues}`);
      }
    }

    if (!found) {
      throw new Error('Could not find matching model for: ' + model);
    }

    const sizeSelectorLoaded = await this.puppeteerUtil.checkLocation(
      '#order_opt_15',
      false,
      false,
    );

    if (!sizeSelectorLoaded) {
      throw new Error('Page failed to load shoe size selector');
    }

    await this.puppeteerUtil.dropdownSelect('#order_opt_15', size);

    const splitter = width.split('-');
    if (splitter.length < 2) {
      throw new Error('invalid width');
    }

    const widthSelectorLoaded = await this.puppeteerUtil.checkLocation(
      '#order_opt_16',
      false,
      false,
    );

    if (!widthSelectorLoaded) {
      throw new Error('Page failed to load shoe width selector');
    }

    await this.puppeteerUtil.dropdownSelect('#order_opt_16', 'w' + splitter[1]);

    await this.puppeteerUtil.click(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      true,
      true,
    );

    const isSupplementlLoaded = await this.puppeteerUtil.checkLocation(
      '#order_info_14',
      false,
      true,
    );

    console.log(isSupplementlLoaded);

    if (!isSupplementlLoaded) {
      console.log('Clicked next again: supplement');
      await this.puppeteerService.tryAgain(
        '#order_info_14',
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        0,
      );
    }
  }

  async inputStsUsageEnvironment(orderNr: string) {
    const endUserIsLoaded = await this.puppeteerUtil.checkLocation(
      '#order_enduser',
      false,
      false,
    );

    if (!endUserIsLoaded) {
      throw new Error('Could not load end user input');
    }
    await this.puppeteerUtil.input('#order_enduser', orderNr);

    let endUserText = await this.puppeteerUtil.getInputValue('#order_enduser');
    if (endUserText !== orderNr) {
      await this.puppeteerUtil.input('#order_enduser', orderNr);
    }

    endUserText = await this.puppeteerUtil.getInputValue('#order_enduser');
    if (endUserText !== orderNr) {
      throw new Error('Failed to input orderNr to end user input');
    }

    const proffesionalSectorDropdownIsLoaded =
      await this.puppeteerUtil.checkLocation('#order_enduser', false, false);

    if (!proffesionalSectorDropdownIsLoaded) {
      throw new Error('Could not load professional sector dropdown');
    }
    await this.puppeteerUtil.dropdownSelect('#order_opt_9', 'Unknown');
    await this.puppeteerUtil.input('#order_function', 'N/A');
    await this.puppeteerUtil.dropdownSelect(
      '#order_opt_26',
      'Safety shoe with protective toecap (EN-ISO 20345:2011)',
    );

    await this.puppeteerUtil.click(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      true,
      true,
    );

    const isModelLoaded = await this.puppeteerUtil.checkLocation(
      '#page-content-wrapper > div > div > div > div.col-md-7 > div',
      false,
      false,
    );

    if (!isModelLoaded) {
      console.log('Clicked next again');
      await this.puppeteerUtil.click(
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        true,
        true,
      );
    }
  }

  async supplement(insole: boolean, dev: boolean) {
    const isSupplementlLoaded = await this.puppeteerUtil.checkLocation(
      '#order_info_14',
      false,
      true,
    );

    if (!isSupplementlLoaded) {
      throw new Error('Could not get to supplement page');
    }

    if (insole) {
      await this.puppeteerUtil.click('#order_info_14', true, true);

      const isSupplementlLoaded = await this.puppeteerUtil.checkLocation(
        '#choice_224',
        false,
        true,
      );

      if (!isSupplementlLoaded) {
        throw new Error('Could not get to orthotic/inlay modal');
      }

      if (isSupplementlLoaded) {
        console.log('Supplement is loaded');
      }

      await this.puppeteerUtil.wait(null, 5000);
      await this.puppeteerUtil.click('#choice_224', false, true);
    }

    if (!dev) {
      await this.puppeteerUtil.click('#wizard_button_save', true, true);
    }
  }
}
