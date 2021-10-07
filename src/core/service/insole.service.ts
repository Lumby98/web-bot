import { Injectable } from '@nestjs/common';
import { InsoleFromSheetDto } from '../../api/dto/insole-upload/insole-from-sheet.dto';
import { Page } from 'puppeteer';
import { InsoleModel } from '../models/insole.model';
import { RegisterInsoleDto } from '../../api/dto/insole-upload/register-insole.dto';

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
      await page
        .goto('https://order.ortowear.com/', { waitUntil: 'load' })
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
          '#tab-over-view',
          //if 8 seconds pass and the elements are not load login has failed
          { timeout: 8000 },
        )
        .catch(() => {
          throw new Error('incorrect login information');
        });

      //navigates to the list of all orders
      await InsoleService.navigateToOrders(page);

      const data: InsoleModel[] = [];

      //wait for page to be loaded
      await page.waitForSelector('#orders-table_processing', { hidden: true });

      //loops through all the given insoles and gets the necessary data
      for (const insole of insoleDto.insoles) {
        //finds the insole in the list
        await InsoleService.findInsole(page, insole);
        await page.waitForTimeout(5000);

        //gets the data for it
        const i = await InsoleService.getData(page, insole);

        //adds it to list of complete insoles
        data.push(i);

        //goes back and prepares itself for the next insole
        await page.goBack();
        await page.waitForTimeout(2000);
        await page.waitForSelector('orders-table_processing', { hidden: true });
        await page.waitForSelector('#datatable_searchfield');
        await page.click('#datatable_searchfield', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(2000);
        await page.waitForSelector('orders-table_processing', { hidden: true });
      }
      console.log(data);

      //goes to emma's site to register the insoles
      for (const i of data) {
        //goes to site
        await page.goto(
          'https://www.emmasafetyfootwear.com/orthopaedic/registration-emma-ortho-cover-en',
          { waitUntil: 'load' },
        );

        //register the given insole
        //sends the index of the given insole to know what insole failed to register
        await this.fillForm(page, i, data.indexOf(i));
      }

      return 'complete';
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
      await page.waitForSelector('.btn.btn-ow');
      await page.click('.btn.btn-ow');
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
      //searches for the insole by ordernumber
      const searchText: string = insole.orderNumber.toString();
      await page.type('#datatable_searchfield', searchText);

      //wait for page to find the insole
      await page.waitForSelector('#orders-table_processing', { hidden: false });
      await page.waitForSelector('#orders-table_processing', { hidden: true });

      //select insole and go to its info page
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
      throw new Error(err);
      //throw new Error('failed to get order information');
    }
  }

  /**
   * fills form on emma's website
   * @param page
   * @param insole
   * @param number -- this number is to keep track of what insole is failed to register
   * @private
   */
  private async fillForm(page: Page, insole: InsoleModel, number: number) {
    try {
      //company name field
      await page.type('#id_iFrm_PstFld-2256929-', 'Ortowear');

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
      await page.waitForTimeout(2000);
      await page.click(
        '#id_iFrm_PstFld-2256939-Ik_heb_de_gepersonaliseerde_inlegzool_vervaardigd_' +
          'conform_de_geleverde_werkinstructie\\._Dit_is_de_voorwaarde_voor_behoud_van_de_normen__' +
          'EN-ISO-20345\\:2011_en_EN_ISO_20347\\:2012_welke_in_overeenstemming_zijn_met_de_bepalingen_in_de' +
          '_richtlijn_89_686_EEC_96_58__EC_en__uitsluitend_geldig_in_combinatie_met_reeds_gecertificeerd_EMMA_' +
          'Safety_Footwear_producten\\.-',
      );

      //completed by
      await page.type('#id_iFrm_PstFld-2256941-', 'Ortowear');

      //clicks send button - disabled for now
      //await page.click('#js_tail2256943 > div > input.frm_BtnSubmit');

      await page.waitForTimeout(10000);
    } catch (err) {
      throw new Error('failed to register insole number: ' + number++);
    }
  }
}
