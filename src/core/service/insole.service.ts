import { Injectable } from '@nestjs/common';
import { InsoleFromSheetDto } from '../../api/dto/insole-upload/insole-from-sheet.dto';
import { Page } from 'puppeteer';
import { InsoleModel } from '../models/insole.model';
import { RegisterInsoleDto } from '../../api/dto/insole-upload/register-insole.dto';
import { timeout } from 'rxjs/operators';

@Injectable()
export class InsoleService {
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

      //goes to ortowears page to get data of the given insoles
      //for testing replace 'order' with 'beta'
      await page
        .goto('https://beta.ortowear.com/', { waitUntil: 'networkidle2' })
        .catch(() => {
          throw new Error('could not reach Ortowear');
        });

      //logs in to the site
      await InsoleService.handleLogin(
        page,
        insoleDto.username,
        insoleDto.password,
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
        //finds the insole in the list
        const check = await InsoleService.findInsole(page, insole);
        //if findInsole returns a value, means the insole was not found
        //the loop will then go to the next insole
        if (check) {
          await page.click('#datatable_searchfield', { clickCount: 3 });
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
        const i = await InsoleService.getData(page, insole);

        //adds it to list of complete insoles
        data.push(i);

        //goes back and prepares itself for the next insole
        await page.goto(
          'https://beta.ortowear.com/administration/ordersAdmin/',
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
            { waitUntil: 'load' },
          );

          //register the given insole
          //sends the index of the given insole to know what insole failed to register
          await InsoleService.fillForm(page, i, data.indexOf(i));
        }
      }

      //creation of completion message shown to the user
      let returnString = 'complete';
      //if any insoles where not created add the order number of the insole to the message
      if (couldNotFind) {
        returnString += ', but could not find insoles with order number: ';
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
      await page.goto('https://beta.ortowear.com/administration/ordersAdmin', {
        waitUntil: 'load',
      });

      //wait for the page to finish loading
      await page.waitForSelector('#orders-table_processing', { hidden: true });
    } catch (err) {
      throw new Error('failed to get order list');
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
      //searches for the insole by order number
      const searchText: string = insole.orderNumber.toString();
      await page.type('#datatable_searchfield', searchText);

      //wait for page to find the insole
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
        return target;
      }
      await page.click('#orders-table > tbody > tr');
      await page.click('#orders-table > tbody > tr');
      await page.click('#topBtns > div > div > button.btn.btn-sm.btn-warning');
    } catch (err) {
      throw new Error('failed to find order');
    }
  }

  /**
   * gets the data of an Insole
   * @param page
   * @param insole
   * @private
   */
  private static async getData(
    page: Page,
    insole: InsoleFromSheetDto,
  ): Promise<InsoleModel> {
    try {
      //gets the size of the insole
      const size = await page.$eval(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) >' +
          ' div > div > div > div.box-body > form > div:nth-child(3) > div:nth-child(1) > div > div > table >' +
          ' tbody > tr:nth-child(2) > td:nth-child(2) > p',
        (p) => p.textContent,
      );

      //gets the model of shoe the insole is for
      const modelWithName = await page.$eval(
        'body > div.wrapper > div.content-wrapper > section.content > div:nth-child(3) > div > div >' +
          ' div > div.box-body > form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(1) > table > tbody >' +
          ' tr:nth-child(1) > td:nth-child(2) > p',
        (p) => p.textContent,
      );

      //splites the model string to only get the article number
      const spliter = modelWithName.split(' ');
      const model = spliter[0];

      //retun a InsoleModel
      return {
        orderNumber: insole.orderNumber,
        registrationCode: insole.registrationCode,
        size: size,
        model: model,
      };
    } catch (err) {
      throw new Error('failed to get order information');
    }
  }

  /**
   * fills form on emma's website
   * @param page
   * @param insole
   * @param number -- this number is to keep track of what insole is failed to register
   * @private
   */
  private static async fillForm(
    page: Page,
    insole: InsoleModel,
    number: number,
  ) {
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
        insole.registrationCode.toString(),
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

      //clicks send button - disabled for now
      //await page.click('#js_tail2256943 > div > input.frm_BtnSubmit');

      await page.waitForTimeout(10000);
    } catch (err) {
      throw new Error('failed to register insole number: ' + number++);
    }
  }

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
