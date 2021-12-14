import { Inject, Injectable } from '@nestjs/common';
import { InsoleFromSheetDto } from '../../ui.api/dto/insole-upload/insole-from-sheet.dto';
import { Page } from 'puppeteer';
import { InsoleModel } from '../models/insole.model';
import { RegisterInsoleDto } from '../../ui.api/dto/insole-upload/register-insole.dto';
import { InsoleInterface } from '../interfaces/insole.interface';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../interfaces/savedLoginService.interface';
import { LoginTypeEnum } from '../enums/loginType.enum';

@Injectable()
export class InsoleService implements InsoleInterface {
  constructor(
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
  ) {}
  puppeteer = require('puppeteer');

  /**
   * registers a list of insoles
   * @param insoleDto
   */
  async registerInsole(insoleDto: RegisterInsoleDto) {
    // Launch the browser (use 'headless: false' in the launch method, to see how puppeteer navigates)
    const browser = await this.puppeteer.launch({
      /*args: ['--no-sandbox', '--disable-setuid-sandbox'],*/ headless: false,
    });
    try {
      //opens a new fan
      const page = await browser.newPage();

      //goes to Ortowears page to get data of the given insoles
      //for testing replace 'order-registration' with 'beta'
      await page
        .goto('https://order.ortowear.com/', { waitUntil: 'networkidle2' })
        .catch(() => {
          throw new Error('could not reach Ortowear');
        });

      //Get the ortowearLogin from saveLoginService using the key provided in the dto
      const ortowearLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.ORTOWEAR,
        insoleDto.key,
      );

      //logs in to the site
      await InsoleService.handleLogin(
        page,
        ortowearLogin.username,
        ortowearLogin.password,
      );

      //wait for elements on the frontpage after login for 8 seconds to ensure the user is logged in
      await page
        .waitForSelector(
          '#tab-over-view > div > div.home-main.admin-panel > div',
          //if 8 seconds pass and the elements are not load login has failed
          { timeout: 8000 },
        )
        .catch(() => {
          throw new Error('incorrect login information');
        });

      //sets the language on the page
      await InsoleService.choseLanguage(page);

      //navigates to the list of all orders
      await InsoleService.navigateToOrders(page);

      const data: InsoleModel[] = [];
      const couldNotFind: InsoleFromSheetDto[] = [];

      //wait for page to be loaded
      await page.waitForSelector('#orders-table_processing', { hidden: true });

      //loops through all the given insoles and gets the necessary data
      for (const insole of insoleDto.insoles) {
        await page.click('#datatable_searchfield', {
          clickCount: 3,
          delay: 100,
        });
        await page.keyboard.press('Backspace');
        //finds the insole in the list
        const check = await InsoleService.findInsole(page, insole);
        //if findInsole returns a value, means the insole was not found
        //the loop will then go to the next insole
        if (check == 'could not find') {
          await page.click('#datatable_searchfield', {
            clickCount: 3,
            delay: 100,
          });
          await page.keyboard.press('Backspace');
          couldNotFind.push(insole);
          console.log(couldNotFind);
          await page.waitForTimeout(2000);
          await page.waitForSelector('orders-table_processing', {
            hidden: true,
          });
          continue;
        }
        await page.waitForTimeout(5000);

        //gets the data for it
        const i = await InsoleService.getData(page, insole, check);

        //adds it to list of complete insoles
        data.push(i);

        //goes back and prepares itself for the next insole
        await page.goto(
          'https://order.ortowear.com/administration/ordersAdmin/',
          { waitUntil: 'networkidle2' },
        );
        await page.waitForTimeout(2000);
        await page.waitForSelector('orders-table_processing', { hidden: true });
        await page.waitForSelector('#datatable_searchfield');
      }
      console.log(data);

      //if insoles has been found go to emma and register
      if (data) {
        //goes to emma's site to register the insoles
        for (const i of data) {
          //goes to site
          await page.goto(
            'https://www.emmasafetyfootwear.com/orthopaedic/registration-emma-ortho-cover-en',
            { waitUntil: 'networkidle2' },
          );

          //register the given insole
          //sends the index of the given insole to know what insole failed to register
          const check = await InsoleService.fillForm(page, i);
          //if the insole is returned an error occurred and the insole was not created
          console.log(check);
          if (check) {
            couldNotFind.push({
              orderNumber: i.orderNumber,
              registrationCode: i.registrationCode,
            });
          }
        }
      }

      //creation of completion message shown to the user
      let returnString = 'complete';
      //if any insoles where not created add the order-registration number of the insole to the message
      console.log(couldNotFind.length + ' arr');
      if (couldNotFind.length > 0) {
        returnString +=
          ', but failed to register insoles with order-registration number: ';
        for (const failed of couldNotFind) {
          returnString += failed.orderNumber + ', ';
        }
      }
      return returnString;
    } catch (err) {
      throw err;
    } finally {
      await browser.close();
    }
  }

  /**
   * login to ortowear
   * @param page
   * @param username
   * @param password
   * @private
   */
  private static async handleLogin(
    page: Page,
    username: string,
    password: string,
  ) {
    try {
      //inputs username and password
      await page.type('#email', username);
      await page.type('#password', password);

      //clicks login button
      await page.waitForSelector('#loginForm > input.btn.btn-ow');
      await page.click('#loginForm > input.btn.btn-ow');
    } catch (err) {
      throw new Error('failed to login to Ortowear');
    }
  }

  /**
   * navigates to list of orders
   * @param page
   * @private
   */
  private static async navigateToOrders(page: Page) {
    try {
      //goes to page with orders
      await page.goto('https://order.ortowear.com/administration/ordersAdmin', {
        waitUntil: 'networkidle2',
      });

      //wait for the page to finish loading
      await page.waitForSelector('#orders-table_processing', { hidden: true });
    } catch (err) {
      throw new Error('failed to get order-registration list');
    }
  }

  /**
   * find an insole
   * @param page
   * @param insole
   * @private
   */
  private static async findInsole(page: Page, insole: InsoleFromSheetDto) {
    try {
      //searches for the insole by order-registration number
      const searchText: string = insole.orderNumber.toString();
      await page.type('#datatable_searchfield', searchText.trim());

      //wait for page to find the insole
      await page.waitForTimeout(2000);
      await page.waitForSelector('#orders-table_processing', { hidden: false });
      await page.waitForSelector('#orders-table_processing', { hidden: true });

      //select insole and go to its info page
      const target = await page.$eval(
        '#orders-table > tbody > tr > td',
        (el) => el.textContent,
      );

      //if an insole cannot be found return with a message to indicate the insole could not be found
      if (
        target == 'Ingen linjer matcher søgningen' ||
        target == 'No matching records found'
      ) {
        console.log(target);
        return 'could not find';
      }
      const type = await page.$eval(
        '#orders-table > tbody > tr > td:nth-child(1)',
        (el) => el.textContent,
      );
      console.log(type);
      await page.waitForSelector('#orders-table > tbody > tr');
      await page.click('#orders-table > tbody > tr');
      await page.click('#orders-table > tbody > tr');
      await page.click('#topBtns > div > div > button.btn.btn-sm.btn-warning');
      if (type.includes('INS')) {
        return 'INS';
      } else {
        return 'STS';
      }
    } catch (err) {
      throw new Error('failed to find order-registration');
    }
  }

  /**
   * gets the data of an Insole
   * @param page
   * @param insole
   * @param type
   * @private
   */
  private static async getData(
    page: Page,
    insole: InsoleFromSheetDto,
    type: string,
  ): Promise<InsoleModel> {
    try {
      let size;
      let model;
      switch (type) {
        case 'STS': {
          //gets the size of the insole
          console.log('before size');
          size = await page.$eval(
            'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div >' +
              ' div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(2)' +
              ' > td:nth-child(2) > p',
            (p) => p.textContent,
          );
          console.log(size);

          //gets the model of shoe the insole is for
          const modelTemp = await page.$eval(
            'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body' +
              ' > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody > tr:nth-child(1)' +
              ' > td:nth-child(2) > p',
            (p) => p.textContent,
          );
          console.log(modelTemp);

          //splites the model string to only get the article number
          const splitter = modelTemp.split(' ');
          model = splitter[0];
          break;
        }
        case 'INS': {
          // gets the size of order-registration
          const s = await page.$eval(
            'body > div.wrapper > div.content-wrapper > section.content > div.row > div > div > div > div.box-body >' +
              ' form > div:nth-child(3) > div > div > div:nth-child(2) > div > div > table > tbody > tr:nth-child(6) > td:nth-child(2)',
            (el) => el.textContent,
          );
          //splits the string in cases where a region is also given i.e 42 EU
          const splitterSize = s.split(' ');
          size = splitterSize[0];

          model = await page.$eval(
            'body > div.wrapper > div.content-wrapper > section.content > div.row > div >' +
              ' div > div > div.box-body > form > div:nth-child(3) > div > div > div:nth-child(2) > div > div > table > tbody >' +
              ' tr:nth-child(2) > td:nth-child(2)',
            (el) => el.textContent,
          );
          break;
        }
        default: {
          throw new Error('failed to define order-registration type');
        }
      }
      //retun a InsoleModel
      return {
        orderNumber: insole.orderNumber,
        registrationCode: insole.registrationCode,
        size: size,
        model: model,
      };
    } catch (err) {
      if (err.message == 'failed to define order-registration type') {
        throw err;
      }
      throw err;
      //throw new Error('failed to get order-registration information');
    }
  }

  /**
   * fills form on emma's website
   * @param page
   * @param insole
   * @private
   */
  private static async fillForm(page: Page, insole: InsoleModel) {
    try {
      //company name field
      await page.type('#id_iFrm_PstFld-2256929-', 'Ortowear', { delay: 200 });

      //email field
      await page.type('#id_iFrm_PstFld-2256931-', 'sales@ortowear.com');

      //model field
      await page.type('#id_iFrm_PstFld-2256933-', insole.model);

      //size dropdown
      await page.select('#id_iFrm_PstFld-2256935-', insole.size);

      //registrasion code
      await page.type(
        '#id_iFrm_PstFld-2256937-',
        insole.registrationCode.toString().trim(),
      );
      //checkbox
      await page.waitForSelector(
        '#id_iFrm_PstFld-2256939-Ik_heb_de_gepersonaliseerde_inlegzool_vervaardigd_conform_de_geleverde_werkinstructie\\._Dit_is_de_voorwaarde_voor_behoud_van_de_normen__EN-ISO-20345\\:2011_en_EN_ISO_20347\\:2012_welke_in_overeenstemming_zijn_met_de_bepalingen_in_de_richtlijn_89_686_EEC_96_58__EC_en__uitsluitend_geldig_in_combinatie_met_reeds_gecertificeerd_EMMA_Safety_Footwear_producten\\.-',
      );
      const checkbox = await page.$(
        '#id_iFrm_PstFld-2256939-Ik_heb_de_gepersonaliseerde_inlegzool_vervaardigd_conform_de_geleverde_werkinstructie\\._Dit_is_de_voorwaarde_voor_behoud_van_de_normen__EN-ISO-20345\\:2011_en_EN_ISO_20347\\:2012_welke_in_overeenstemming_zijn_met_de_bepalingen_in_de_richtlijn_89_686_EEC_96_58__EC_en__uitsluitend_geldig_in_combinatie_met_reeds_gecertificeerd_EMMA_Safety_Footwear_producten\\.-',
      );
      console.log(await (await checkbox.getProperty('checked')).jsonValue());
      await page.evaluate((cb) => cb.click(), checkbox);
      console.log(await (await checkbox.getProperty('checked')).jsonValue());

      //completed by
      await page.type('#id_iFrm_PstFld-2256941-', 'Ortowear');

      //clicks send button and waits for 5 seconds - disabled for now
      await page.click('#js_tail2256943 > div > input.frm_BtnSubmit');
      await page.waitForTimeout(5000);
    } catch (err) {
      return insole;
    }
  }

  /**
   * chooses the language on ortowear
   * @param page
   * @private
   */
  private static async choseLanguage(page: Page) {
    try {
      await page.waitForTimeout(5000);
      await page.click(
        'body > div:nth-child(4) > div.navbar-custom > header > nav > button',
      );
      await page.waitForSelector(
        '#navbarTogglerMainMenu > ul > div.language-small-device > span:nth-child(2) > div > a > span',
      );
      await page.click(
        '#navbarTogglerMainMenu > ul > div.language-small-device > span:nth-child(2) > div > a > span',
      );
      await page.waitForTimeout(2000);
    } catch (err) {
      throw new Error('failed to set langauge settings on Ortowear');
    }
  }
}
