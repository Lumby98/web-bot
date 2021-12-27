import { Inject, Injectable } from '@nestjs/common';
import { INSSInterface } from '../../../interfaces/order-registration/ins-s/INSS.interface';
import {
  PuppeteerUtilityInterface,
  puppeteerUtilityInterfaceProvider,
} from '../../../../domain.services/puppeteer-utility.interface';
import {
  PuppeteerServiceInterface,
  puppeteerServiceInterfaceProvider,
} from '../../../interfaces/puppeteer/puppeteer-service.Interface';
import { INSSOrderModel } from '../../../../models/ins-s-order.model';
import { OrderInfoModel } from '../../../../models/order-info.model';

@Injectable()
export class InssService implements INSSInterface {
  constructor(
    @Inject(puppeteerUtilityInterfaceProvider)
    private readonly puppeteerUtil: PuppeteerUtilityInterface,
    @Inject(puppeteerServiceInterfaceProvider)
    private readonly puppeteerService: PuppeteerServiceInterface,
  ) {}

  async confirmation() {
    const quantity = await this.puppeteerUtil.readSelectorText(
      '#order_quantity',
    );
    if (quantity != '1') {
      await this.puppeteerUtil.dropdownSelect('#order_quantity', '1');
    }

    const deliveryTime = await this.puppeteerUtil.readSelectorText(
      '#order_opt_32',
    );
    if (deliveryTime != 'Standard') {
      await this.puppeteerUtil.dropdownSelect('#order_opt_32', 'Standard');
    }
  }

  async handleINSSOrder(
    orderNumber: string,
    selector: string,
  ): Promise<INSSOrderModel> {
    if (!selector || selector.length < 1) {
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

    const order: OrderInfoModel = await this.puppeteerUtil.readOrder(
      orderNumber,
    );

    const inssOrder: INSSOrderModel = await this.puppeteerUtil.readINSSOrder(
      order,
    );

    if (!inssOrder) {
      throw new Error('failed getting order-registration information');
    }

    if (inssOrder.orderNr != orderNumber) {
      throw new Error('failed getting correct order-registration');
    }

    /*    if (
      (inssOrder.sizeR || inssOrder.sizeR != '') &&
      (!inssOrder.sizeL || inssOrder.sizeL == '')
    ) {
      inssOrder.sizeL = inssOrder.sizeR;
    } else if (
      (!inssOrder.sizeR || inssOrder.sizeR == '') &&
      (inssOrder.sizeL || inssOrder.sizeL != '')
    ) {
      inssOrder.sizeR = inssOrder.sizeL;
    } else if (
      (!inssOrder.sizeR || inssOrder.sizeR == '') &&
      (!inssOrder.sizeL || inssOrder.sizeL == '')
    ) {
      throw new Error(
        'Both sizes are empty. Please amend the order entry on the site',
      );
    }*/

    if (
      inssOrder.sizeR &&
      inssOrder.sizeR != '' &&
      (!inssOrder.sizeL || inssOrder.sizeL == '')
    ) {
      inssOrder.sizeL = inssOrder.sizeR;
    } else if (
      (!inssOrder.sizeR || inssOrder.sizeR == '') &&
      inssOrder.sizeL &&
      inssOrder.sizeL != ''
    ) {
      inssOrder.sizeR = inssOrder.sizeL;
    } else if (
      (!inssOrder.sizeR || inssOrder.sizeR == '') &&
      (!inssOrder.sizeL || inssOrder.sizeL == '')
    ) {
      throw new Error(
        'Both sizes are empty. Please amend the order entry on the site',
      );
    }

    if (!inssOrder.model || inssOrder.model == '') {
      throw new Error('failed getting model');
    }

    if (!inssOrder.deliveryAddress || inssOrder.deliveryAddress.length < 3) {
      throw new Error('failed getting delivery address');
    }

    if (!inssOrder.customerName || inssOrder.customerName == '') {
      throw new Error('failed getting customer');
    }

    const substring = 'Norway';
    if (inssOrder.deliveryAddress.includes(substring)) {
      inssOrder.EU = false;
    }

    return inssOrder;
  }

  async inputInssModel(order: INSSOrderModel) {
    const isModelLoaded = await this.puppeteerUtil.checkLocation(
      '#insoleForm',
      false,
      true,
      30000,
    );

    if (!isModelLoaded) {
      throw new Error('failed to load model page');
    }

    const isModelDropdown =
      '#page-content-wrapper > div > div > div > form > div:nth-child(2) > div > div';

    const modelDropdownResult = await this.puppeteerUtil.checkLocation(
      isModelDropdown,
      false,
      false,
    );

    if (!modelDropdownResult) {
      throw new Error('Cannot load dropdown!');
    }

    // await this.waitClick(isModelDropdown);

    /* await this.waitClick(
      '#page-content-wrapper > div > div > div > form > div:nth-child(2) > div > div > span',
    );*/

    await this.puppeteerUtil.click(
      '#page-content-wrapper > div > div > div > form > div:nth-child(2) > div > div > span',
      true,
      true,
    );

    await this.puppeteerUtil.wait('#choiceinvalidLabel', 2000);

    const IsModelModal = await this.puppeteerUtil.checkLocation(
      '#choiceinvalidLabel',
      false,
      true,
    );

    if (!IsModelModal) {
      await this.puppeteerUtil.wait('#choiceinvalidLabel', 2000);
      console.log('click');
      await this.puppeteerUtil.click(
        '#page-content-wrapper > div > div > div > form > div:nth-child(2) > div > div > span',
        true,
        true,
      );
    }
    const brandName = await this.puppeteerUtil.searchableSelect(order.model);

    await this.puppeteerUtil.wait(
      '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > div.form > form > div:nth-child(3)',
      5000,
    );

    await this.puppeteerUtil.selectInputContainerByArticleName(
      order.model,
      '#scrollrbody > div.modal.fade.modal-choiceinvalid.in > div > div > div.modal-body > div > div.form > form > div:nth-child(3)',
      brandName,
    );

    /*
    Click on Orthotic card.
     */
    //wait for the button to load.
    await this.puppeteerUtil.wait('#cemod_1', 5000);

    //Click on the button
    await this.puppeteerUtil.click('#cemod_1', true, false);

    /*
    Select size
    */
    const sizeLSplit = order.sizeL.split(' ');
    const sizeRSplit = order.sizeR.split(' ');

    await this.puppeteerUtil.click('#model_thumb9', true, true);
    await this.puppeteerUtil.click(
      '#insoleForm > div:nth-child(3) > div > div:nth-child(3)',
      true,
      true,
    );

    //select left size.
    await this.puppeteerUtil.dropdownSelect('#order_opt_left15', sizeLSplit[0]);

    //select right size.
    await this.puppeteerUtil.dropdownSelect(
      '#order_opt_right15',
      sizeRSplit[0],
    );

    await this.puppeteerUtil.wait('#model_thumb9', 3000);
    const isCoverSafety = await this.puppeteerUtil.checkLocation(
      '#model_thumb9',
      false,
      true,
    );

    if (!isCoverSafety) {
      await this.puppeteerUtil.wait('#model_thumb9', 3000);

      const coverSafetyNotGone = await this.puppeteerUtil.checkLocation(
        '#model_thumb9',
        false,
        true,
      );

      //checks again if the selector is there
      if (!coverSafetyNotGone) {
        throw new Error('Cannot find cover safety selector!');
      }
      //click the selector
      await this.puppeteerUtil.clickRadioButton('#model_thumb9');
    } else {
      //click the selector
      await this.puppeteerUtil.clickRadioButton('#model_thumb9');
    }

    await this.puppeteerUtil.click(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      true,
      true,
    );

    const isOrthoticsLoaded = await this.puppeteerUtil.checkLocation(
      '#order_opt_107',
      false,
      true,
    );

    if (!isOrthoticsLoaded) {
      console.log('Clicked next again: orthotics');
      await this.puppeteerService.tryAgain(
        '#order_opt_107',
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        0,
      );
    }
  }

  async inputInssUsageEnvironment(order: INSSOrderModel) {
    //Input Registration no. medical specialist
    const regNoIsLoaded = await this.puppeteerUtil.checkLocation(
      '#order_agb',
      false,
      false,
    );

    if (!regNoIsLoaded) {
      throw new Error(
        'Could not load Registration no. medical specialist input',
      );
    }

    await this.puppeteerUtil.input('#order_agb', order.customerName);

    let regNoText = await this.puppeteerUtil.getInputValue('#order_agb');
    if (regNoText !== order.customerName) {
      await this.puppeteerUtil.input('#order_agb', order.customerName);
    }

    regNoText = await this.puppeteerUtil.getInputValue('#order_agb');
    if (regNoText !== order.customerName) {
      throw new Error(
        'Failed to input Registration no. medical specialist input',
      );
    }

    //Input end user.
    const endUserIsLoaded = await this.puppeteerUtil.checkLocation(
      '#order_enduser',
      false,
      false,
    );

    if (!endUserIsLoaded) {
      throw new Error('Could not load end user input');
    }

    await this.puppeteerUtil.input('#order_enduser', order.orderNr);

    let endUserText = await this.puppeteerUtil.getInputValue('#order_enduser');
    if (endUserText !== order.orderNr) {
      await this.puppeteerUtil.input('#order_enduser', order.orderNr);
    }

    endUserText = await this.puppeteerUtil.getInputValue('#order_enduser');
    if (endUserText !== order.orderNr) {
      throw new Error('Failed to input orderNr to end user input');
    }

    //Check dropdown value.
    await this.puppeteerUtil.dropdownSelect(
      '#order_opt_104',
      'Safety (S-classification)',
    );

    //Go to brand and model page.

    await this.puppeteerUtil.click(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      true,
      true,
    );

    const isModelLoaded = await this.puppeteerUtil.checkLocation(
      '#insoleForm',
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

  async orthotics() {
    this.puppeteerUtil.wait('#order_opt_107', 5000);
    const isOrthoticsLoaded = await this.puppeteerUtil.checkLocation(
      '#order_opt_107',
      false,
      true,
    );

    if (!isOrthoticsLoaded) {
      throw new Error('Could not get to supplement page');
    }

    this.puppeteerUtil.dropdownSelect('#order_opt_107', '4/4');

    await this.puppeteerUtil.wait(
      '#page-content-wrapper > div > div > div > form > div:nth-child(2) > div > div',
      2000,
    );
    console.log('click');
    await this.puppeteerUtil.click(
      '#page-content-wrapper > div > div > div > form > div:nth-child(2) > div > div',
      true,
      true,
    );

    await this.puppeteerUtil.wait('#choice_401', 3000);
    const isCoverModal = await this.puppeteerUtil.checkLocation(
      '#choice_401',
      false,
      true,
    );

    if (!isCoverModal) {
      await this.puppeteerUtil.wait('#choice_401', 3000);

      const coverNotGone = await this.puppeteerUtil.checkLocation(
        '#choice_401',
        false,
        true,
      );

      //checks again if the selector is there
      if (!coverNotGone) {
        throw new Error('Cannot find cover selector!');
      }
      //click the selector
      await this.puppeteerUtil.clickRadioButton('#choice_401');
    } else {
      //click the selector
      await this.puppeteerUtil.clickRadioButton('#choice_401');
    }

    await this.puppeteerUtil.click(
      '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
      true,
      true,
    );

    const isConfirmationLoaded = await this.puppeteerUtil.checkLocation(
      '#order_quantity',
      false,
      true,
    );

    if (!isConfirmationLoaded) {
      console.log('Clicked next again: confirmation');
      await this.puppeteerService.tryAgain(
        '#order_quantity',
        '#scrollrbody > div.wizard_navigation > button.btn.btn-default.wizard_button_next',
        0,
      );
    }
  }
}
