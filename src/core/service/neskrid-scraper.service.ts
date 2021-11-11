import { Inject, Injectable } from '@nestjs/common';
import { NeskridModel } from '../models/neskrid.model';
import { Page } from 'puppeteer';
import { NeskridScraperInterface } from '../interfaces/neskrid-scraper.interface';
import {
  NeskridInterface,
  neskridInterfaceProvider,
} from '../interfaces/neskrid.interface';

@Injectable()
export class NeskridScraperService implements NeskridScraperInterface {
  puppeteer = require('puppeteer');

  constructor(
    @Inject(neskridInterfaceProvider) private neskridService: NeskridInterface,
  ) {}

  /**
   * scraps Neskrid and writes to a file
   * @param username
   * @param password
   */
  public async scrapNeskrid(
    username: string,
    password: string,
  ): Promise<NeskridModel[]> {
    // Launch the browser (use 'headless: false' in the launch method, to see how puppeteer navigates)
    const browser = await this.puppeteer.launch({
      /*args: ['--no-sandbox', '--disable-setuid-sandbox'],*/
    });

    try {
      // Creates a new instance of the page
      const page = await browser.newPage();

      // navigates to the web page
      await page
        .goto('https://www.neskrid.com/', { waitUntil: 'load' })
        .catch(() => {
          throw new Error('could not reach Neskrid');
        });

      //set language on page
      await page.waitForSelector(
        '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      );

      await page
        .click(
          '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
        )
        .catch(() => {
          throw new Error('could not find selector for language selection');
        });

      await this.handleLogin(page, username, password);

      await this.handleNavigationToProducts(page);

      // get the different brands in the dropdown menu
      const brandNames = await page.$$eval('.searchable-select-item', (items) =>
        items.map((item) => item.innerHTML),
      );

      //removes the first object, since it is not a brand
      brandNames.shift();

      //closes dropdown menu
      await page.waitForSelector('.searchable-select-caret');
      await page.click('.searchable-select-caret');

      // get the different products
      const products = [];
      for (const brand of brandNames) {
        products.push(...(await this.getProductsFromPage(page, brand)));
      }

      //close the browser
      await browser.close();

      // return the list of products
      return await this.updateAfterScrape(products);
    } catch (err) {
      throw err;
    } finally {
      await browser.close();
    }
  }

  /**
   * updates the database table by comparing the current products in the database
   * @param products
   */
  public async updateAfterScrape(
    products: NeskridModel[],
  ): Promise<NeskridModel[]> {
    const completedList: NeskridModel[] = [];
    try {
      const productsInDatabase = await this.neskridService.findAll();

      const updateProductList = [];
      const createProductList = [];
      const missingProductList = [];
      for (const product of products) {
        let p: NeskridModel;
        //checks if the product already exists
        p = productsInDatabase.find(
          (x) =>
            x.brand === product.brand && x.articleName === product.articleName,
        );
        //if it exist set active to 1
        if (p) {
          p.active = 1;
          updateProductList.push(p);
        } else {
          createProductList.push(product);
        }
      }

      completedList.push(
        ...(await this.neskridService.createAll(createProductList)),
      );

      completedList.push(
        ...(await this.neskridService.updateAll(updateProductList)),
      );

      //loop through the initial list of products from the database
      // looking for missing products from the given list
      for (const product of productsInDatabase) {
        const missing = completedList.find(
          (x) =>
            x.brand === product.brand && x.articleName === product.articleName,
        );

        if (!missing) {
          product.active = 0;
          missingProductList.push(product);
        }
      }

      completedList.push(
        ...(await this.neskridService.updateAll(missingProductList)),
      );

      return completedList;
    } catch (err) {
      throw err;
    }
  }

  private async handleLogin(page: Page, username: string, password: string) {
    try {
      //navigate to login
      await page.waitForSelector('.last a').catch(() => {
        throw new Error('could not find login button');
      });
      await page.click('.last a');

      //login
      await page.waitForSelector('#gebruikerscode').catch(() => {
        throw new Error('could not find selector for input field for username');
      });
      //login input
      await page.type('#gebruikerscode', username);
      await page.type('#gebruikerspass', password).catch(() => {
        throw new Error('could not find selector for input field for password');
      });

      await page.click('.login-form button').catch(() => {
        throw new Error('could not find login button');
      });
      await page.waitForTimeout(2000);
    } catch (err) {
      throw err;
    }
  }

  private async handleNavigationToProducts(page: Page) {
    try {
      //navigate to scraping content
      await page
        .waitForSelector(
          '.ms-hero-bg-royal',
          { timeout: 8000 }, //waits a maximum of 8 seconds after pressing login
        )
        .catch(() => {
          //if there is a timeout, it is assumed that the username or password is incorrect
          throw new Error(
            'failed to login username or password might be incorrect',
          );
        });

      await page.click(
        '.card.card-yellow.animated.fadeInUp.animation-delay-7 .ms-hero-bg-royal',
      );
      await page.waitForSelector('.searchable-select-holder', {
        timeout: 5000,
      });
      await page.click('.searchable-select-holder');
    } catch (err) {
      if (
        err.message == 'failed to login username or password might be incorrect'
      ) {
        throw err;
      } else {
        throw new Error('failed at login');
      }
    }
  }

  private async getProductsFromPage(
    page: Page,
    brand: string,
  ): Promise<NeskridModel[]> {
    try {
      //opens dropdown menu
      await page.waitForSelector('.searchable-select-holder');
      await page.click('.searchable-select-holder');
      await page.waitForTimeout(500);

      //search for the current brand and selects it
      await page.type('.searchable-select-input', brand);
      await page.keyboard.press('Enter');

      //gets the article names for the current brand
      await page.waitForSelector('.input-container');
      const articles = await page.$$('.input-container');

      const products: NeskridModel[] = [];

      //gets the article number for the current brand
      for (const article of articles) {
        const articleName = await article.$eval(
          '.color-primary',
          (el) => el.textContent,
        );
        let articleNo;
        articleNo = await article
          .$eval('small', (el) => el.textContent)
          .catch(() => {
            articleNo = 'h:no article number';
          });
        if (articleNo == undefined) {
          articleNo = 'h:no article number';
        }
        //splits the articleNo string to only get the article number
        const splitter = articleNo.split(':');
        articleNo = splitter[1].trim();
        const product: NeskridModel = {
          brand: brand,
          articleName: articleName,
          articleNo: articleNo,
          active: 1,
        };
        console.log(product);
        products.push(product);
      }
      return products;
    } catch (err) {
      throw new Error('failed to get products');
    }
  }
}
