import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HultaforsModel } from '../../../models/hultafors.model';
import { ElementHandle, Page } from 'puppeteer';
import { SizeModel } from '../../../models/size.model';
import { HultaforsService } from '../data-collection/hultafors.service';
import {
  HultaforsScraperInterface,
  hultaforsScraperInterfaceProvider,
} from '../../interfaces/scraper/hultafors-scraper.interface';
import {
  HultaforsInterface,
  hultaforsInterfaceProvider,
} from '../../interfaces/data-collection/hultafors.interface';

@Injectable()
export class HultaforsScraperService implements HultaforsScraperInterface {
  puppeteer = require('puppeteer');

  constructor(
    @Inject(hultaforsInterfaceProvider)
    private hultaforsService: HultaforsInterface,
  ) {}

  /**
   * scrapes Hultafors
   * @param username
   * @param password
   */
  async scrapeHultafors(username: string, password: string): Promise<any[]> {
    // Launch the browser ( add 'headless: false' to launch method, to watch puppeteer navigate)
    const browser = await this.puppeteer.launch({
      headless: false,
      /*args: ['--no-sandbox', '--disable-setuid-sandbox'],*/
    });

    try {
      // Creates a new instance of the page
      const page = await browser.newPage();

      // navigates to the web page (hultafors)
      await page
        .goto(
          'https://partnerportal.hultaforsgroup.dk/user/login?ReturnUrl=%2f',
          { waitUntil: 'load' },
        )
        .catch(() => {
          throw new Error('could not reach Hultafors');
        });

      //Get rid of cookie notification
      await page.waitForSelector(
        '#cookieNotification > div:nth-child(2) > div > div > a',
      );
      const checkbox = await page.$(
        '#cookieNotification > div:nth-child(2) > div > div > a',
      );
      await page.evaluate((cb) => cb.click(), checkbox);
      await this.handleLogin(page, username, password);

      //waiting for page after login to load, if 8 seconds passes throw an error indicating login failed
      await page
        .waitForSelector('.hamburger', {
          timeout: 8000,
        })
        .catch(() => {
          throw new Error(
            'failed to login username and/or password is incorrect',
          );
        });

      await this.handleNavigationToProducts(page);
      await page.waitForSelector('.product-grid.reloadlist');

      //finds the next page button selector
      await page.waitForSelector(
        '.col-sm-12.product-nav-pagination.pagination.pagination-sm.pull-right .nextpage',
      );
      let nextPage = await page.$('.nextpage');
      let morePages = false;
      if (nextPage) {
        morePages = true;
      }

      //get the links to the different products on each page
      let links: string[] = [];
      while (morePages) {
        await page.waitForSelector('.product');
        //links on current page
        const l = await page.$$eval(
          '.pull-right a.js-product-detail',
          (allAs) => allAs.map((a) => a.href),
        );
        //pushes links to page to the main link list
        l.forEach((k) => {
          links.push(k);
        });
        //checks if there are more pages to get links from
        nextPage = await page.$('.nextpage');
        //if there is another page go to it
        if (nextPage) {
          await page.waitForSelector(
            '#productlist > div:nth-child(4) > div > div > ul > li.nextpage > a',
          );
          await page.click(
            '#productlist > div:nth-child(4) > div > div > ul > li.nextpage > a',
          );
          await page.waitForTimeout(5000);
        } else {
          morePages = false;
        }
      }

      //makes sure there are no duplicate links
      const uniqueSet = new Set(links);
      links = [...uniqueSet];

      //creates a list of all the products based on the links
      const products = await this.createListOfProducts(links, page);

      //add the products to the database and returns the list
      return await this.addListToDatabase(products);
    } catch (err) {
      throw err;
    } finally {
      await browser.close();
    }
  }

  /**
   * handles going through the links and getting the data to create a product
   * @param links
   * @param page
   * @private
   */
  private async createListOfProducts(
    links: string[],
    page: Page,
  ): Promise<HultaforsModel[]> {
    const productList: HultaforsModel[] = [];
    try {
      for (const link of links) {
        //list of the size range the hultafors can provide
        const sizes: SizeModel[] = [
          { size: 35, productName: '', status: 0, date: '' },
          { size: 36, productName: '', status: 0, date: '' },
          { size: 37, productName: '', status: 0, date: '' },
          { size: 38, productName: '', status: 0, date: '' },
          { size: 39, productName: '', status: 0, date: '' },
          { size: 40, productName: '', status: 0, date: '' },
          { size: 41, productName: '', status: 0, date: '' },
          { size: 42, productName: '', status: 0, date: '' },
          { size: 43, productName: '', status: 0, date: '' },
          { size: 44, productName: '', status: 0, date: '' },
          { size: 45, productName: '', status: 0, date: '' },
          { size: 46, productName: '', status: 0, date: '' },
          { size: 47, productName: '', status: 0, date: '' },
          { size: 48, productName: '', status: 0, date: '' },
          { size: 49, productName: '', status: 0, date: '' },
          { size: 50, productName: '', status: 0, date: '' },
          { size: 51, productName: '', status: 0, date: '' },
          { size: 52, productName: '', status: 0, date: '' },
          { size: 53, productName: '', status: 0, date: '' },
        ];

        await page.goto(link);

        //gets article name and number
        await page.waitForSelector('#section_4920 > h1');
        const name = await page.$eval(
          '#section_4920 > h1',
          (h1) => h1.textContent,
        );
        const number = await page.$eval(
          '#section_4919 > p > strong',
          (strong) => strong.textContent,
        );
        //add article name to the different sizes
        sizes.forEach((s) => (s.productName = name));

        //goes to size overview on the page
        await page.waitForSelector(
          '#section_4937 > ul > li.dropdown.hidden-lg > a',
        );
        await page.click('#section_4937 > ul > li.dropdown.hidden-lg > a');

        await page.waitForSelector(
          '#section_4937 > ul > li.dropdown.hidden-lg.open > ul > li:nth-child(3) > a',
        );
        await page.click(
          '#section_4937 > ul > li.dropdown.hidden-lg.open > ul > li:nth-child(3) > a',
        );

        //get the sizes on page
        await page.waitForSelector('.table.add-to-basket-matrix-table');
        //size number
        const s = (
          await page.$$eval(
            '.table.add-to-basket-matrix-table tbody > tr > th',
            (el) => el.map((e) => e.textContent),
          )
        ).map((x) => +x);

        s.shift();

        //gets the availability of each size
        const a = await page.$$eval(
          '#section_469 > div.js-add-to-basket-by-attribute-matrix > table > tbody > tr > td > div > input',
          (elements) => elements.map((e) => e.getAttribute('class')),
        );

        //gets string which contains back in stock date
        const d = await page.$$eval(
          '#section_469 > div.js-add-to-basket-by-attribute-matrix > table >' +
            ' tbody > tr > td > div.input-group.tooltip-item',
          (elements) => elements.map((e) => e.getAttribute('title')),
        );
        console.log(d);

        //maps size, stock status and date to an object
        const sa = (size, active, date) => {
          const arr = [];
          for (let i = 0; i < size.length; i++) {
            const obj: any = {
              size: size[i],
              status: active[i],
              date: date[i],
            };
            arr.push(obj);
          }
          return arr;
        };

        //loops through the found sizes
        for (const size of sa(s, a, d)) {
          const status = size.status;
          const statusSubstring = 'noQtyAvailable';

          //finds the size from the main size array
          const result = sizes.find((arraySize) => {
            return arraySize.size === size.size;
          });

          //checks if the given size is in stock
          if (!status.includes(statusSubstring)) {
            result.status = 1;
          }
          result.productName = name;

          //set back in stock date on the size
          if (!size.date) {
            //in stock
            result.date = '';
          } else if (size.date.includes('Udgået')) {
            //not available anymore
            result.date = 'out';
          } else {
            //out of stock
            const dateSplitDate = size.date.split(':');
            const date = dateSplitDate[1];
            result.date = date.trim();
            console.log(result);
          }
        }

        //creates product and add it to the productList
        const product: HultaforsModel = {
          articleName: name,
          articleNumber: number,
          sizes: sizes,
        };

        productList.push(product);

        //await page.waitForTimeout(60000); //waits 1 min before going to the next product
      }

      return productList;
    } catch (err) {
      throw new Error('failed to get products');
    }
  }

  //add given list of products to the database
  private async addListToDatabase(
    products: HultaforsModel[],
  ): Promise<HultaforsModel[]> {
    const completedList: HultaforsModel[] = [];
    try {
      const productsInDatabase = await this.hultaforsService.findAllProducts();

      //loop through given list
      for (const product of products) {
        console.log(product);
        //checks if product already exist
        let p: HultaforsModel = productsInDatabase.find(
          (x) =>
            x.articleName === product.articleName &&
            x.articleName === product.articleName,
        );
        //if product exists update it else create a new one
        if (p) {
          p = await this.hultaforsService.editProduct(p.articleName, product);
        } else {
          p = await this.hultaforsService.createProduct(product);
        }
        completedList.push(p);
      }
      return completedList;
    } catch (err) {
      throw new Error('failed to save products');
    }
  }

  private async handleLogin(page: Page, username: string, password: string) {
    try {
      // login to site
      await page.waitForSelector('#User_UserName').catch(() => {
        throw new Error('could not reach login');
      });
      await page.type('#User_UserName', username);
      await page.type('#User_Password', password).catch(() => {
        throw new Error('could not reach login');
      });

      //Get rid of cookie notification
      await page.waitForSelector(
        '#loginform > div > div.col-md-10.center-col > div.col-md-12.top30 > button',
      );
      const checkbox = await page.$(
        '#loginform > div > div.col-md-10.center-col > div.col-md-12.top30 > button',
      );
      await page.evaluate((cb) => cb.click(), checkbox);
    } catch (err) {
      throw err;
    }
  }

  private async handleNavigationToProducts(page: Page) {
    try {
      //opens sidebar and navigate to product
      await page.click('.hamburger');
      await page.waitForSelector('.toggle-item.mainmenuproducts');
      await page.click('.toggle-item.mainmenuproducts');

      await page.waitForSelector(
        '#searchboxform > div > div:nth-child(3) > div > div > div > a',
      );

      const selector = await page.$$eval(
        '#searchboxform > div > div:nth-child(3) > div > div > div > a',
        (el: Element[], text: string) => {
          for (let i = 0; i < el.length; i++) {
            if (el[i].textContent === text) {
              return `#searchboxform > div > div:nth-child(3) > div > div > div:nth-child(${
                i + 1
              }) > a`;
            }
          }
        },
        'Emma Safety Footwear ',
      );

      await page.click(selector);

      //selects shoes to only be displayed on the page
      await page.waitForTimeout(1000);
      await page.click(
        '#searchboxform > div > div:nth-child(4) > div > div > div >' +
          ' div.btn-group.js-lvl-1 > button',
      );

      await page.waitForSelector(
        '#searchboxform > div > div:nth-child(4) > div > div > div >' +
          ' div.btn-group.js-lvl-1.open > ul > li:nth-child(1) > a',
      );
      await page.click(
        '#searchboxform > div > div:nth-child(4) > div > div > div >' +
          ' div.btn-group.js-lvl-1.open > ul > li:nth-child(1) > a',
      );
    } catch (err) {
      throw new Error('failed to find products');
    }
  }
}
