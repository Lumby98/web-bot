import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HultaforsModel } from '../models/hultafors.model';
import { Page } from 'puppeteer';
import { SizeModel } from '../models/size.model';

@Injectable()
export class HultaforsScraperService {
  puppeteer = require('puppeteer');

  async scrapeHultafors(username: string, password: string): Promise<any[]> {
    //test in place for checking connection between frontend and backend (delete later)
    if (username == 'test' || password == 'test') {
      return [];
    }
    // Launch the browser
    const browser = await this.puppeteer.launch({ headless: false });

    try {
      // Creates a new instance of the page
      const page = await browser.newPage();

      // navigates to the web page (hultafors)
      await page
        .goto(
          'https://partnerportal.hultaforsgroup.dk/user/login?ReturnUrl=%2f',
        )
        .catch(() => {
          throw new HttpException(
            'could not reach Hultafors',
            HttpStatus.GATEWAY_TIMEOUT,
          );
        });

      // login to site
      await page.waitForSelector('#User_UserName').catch(() => {
        throw new HttpException('could not reach login', HttpStatus.NOT_FOUND);
      });
      await page.type('#User_UserName', username);
      await page.type('#User_Password', password).catch(() => {
        throw new HttpException('could not reach login', HttpStatus.NOT_FOUND);
      });
      await page.click(
        '#loginform > div > div.col-md-10.center-col > div.col-md-12.top30 > button',
      );

      //waiting for login, if login failed will thorw exception 8 sec afterward
      await page
        .waitForSelector('.hamburger', {
          timeout: 8000,
        })
        .catch(() => {
          throw new HttpException(
            'failed to login username and/or password is incorrect',
            HttpStatus.GATEWAY_TIMEOUT,
          );
        });

      //opens sidebar and clicks on product
      await page.click('.hamburger');
      await page.waitForSelector('.toggle-item.mainmenuproducts');
      await page.click('.toggle-item.mainmenuproducts');

      //selects emma safety footwear
      await page.waitForSelector(
        '#searchboxform > div > div:nth-child(3) > div > div > div:nth-child(3) > a',
      );
      await page.click(
        '#searchboxform > div > div:nth-child(3) > div > div > div:nth-child(3) > a',
      );

      //selects shoes to only display shoes on the page
      await page.waitForTimeout(1000);
      await page.click(
        '#searchboxform > div > div:nth-child(4) > div > div > div > div.btn-group.js-lvl-1 > button',
      );

      await page.waitForSelector(
        '#searchboxform > div > div:nth-child(4) > div > div > div > div.btn-group.js-lvl-1.open > ul > li:nth-child(1) > a',
      );
      await page.click(
        '#searchboxform > div > div:nth-child(4) > div > div > div > div.btn-group.js-lvl-1.open > ul > li:nth-child(1) > a',
      );
      await page.waitForSelector('.product-grid.reloadlist');

      //finds the next button selector
      await page.waitForSelector(
        '.col-sm-12.product-nav-pagination.pagination.pagination-sm.pull-right .nextpage',
      );
      let nextPage = await page.$('.nextpage');
      let morePages = false;
      if (nextPage) {
        morePages = true;
      }
      let links: string[] = [];
      //gets the links to the different products
      while (morePages) {
        await page.waitForSelector('.product');
        const l = await page.$$eval(
          '.pull-right a.js-product-detail',
          (allAs) => allAs.map((a) => a.href),
        );
        l.forEach((k) => {
          console.log(k);
          links.push(k);
        });
        nextPage = await page.$('.nextpage');
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
      //for some reason duplicates the first page,
      // so here a Set is performed to make sure all values in links are unique
      const uniqueSet = new Set(links);
      links = [...uniqueSet];
      console.log(links.length);

      return await this.createListOfProducts(links, page);
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
        const sizes: SizeModel[] = [
          { size: 35, productName: '', status: 0 },
          { size: 36, productName: '', status: 0 },
          { size: 37, productName: '', status: 0 },
          { size: 38, productName: '', status: 0 },
          { size: 39, productName: '', status: 0 },
          { size: 40, productName: '', status: 0 },
          { size: 41, productName: '', status: 0 },
          { size: 42, productName: '', status: 0 },
          { size: 43, productName: '', status: 0 },
          { size: 44, productName: '', status: 0 },
          { size: 45, productName: '', status: 0 },
          { size: 46, productName: '', status: 0 },
          { size: 47, productName: '', status: 0 },
          { size: 48, productName: '', status: 0 },
          { size: 49, productName: '', status: 0 },
          { size: 50, productName: '', status: 0 },
          { size: 51, productName: '', status: 0 },
          { size: 52, productName: '', status: 0 },
          { size: 53, productName: '', status: 0 },
        ];

        console.log(sizes);
        await page.goto(links[1]);
        //gets article name and number
        await page.waitForSelector('#section_4920 > h1');
        const articleName = await page.$eval(
          '#section_4920 > h1',
          (h1) => h1.textContent,
        );
        const articleNumber = await page.$eval(
          '#section_4919 > p > strong',
          (strong) => strong.textContent,
        );
        console.log(articleName + ' ' + articleNumber);
        sizes.forEach((s) => (s.productName = articleName));

        //goes to sizes
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

        await page.waitForSelector('.table.add-to-basket-matrix-table');
        const s = (
          await page.$$eval(
            '.table.add-to-basket-matrix-table tbody > tr > th',
            (el) => el.map((e) => e.textContent),
          )
        ).map((x) => +x);

        s.shift();

        const a = await page.$$eval(
          '#section_469 > div.js-add-to-basket-by-attribute-matrix > table > tbody > tr > td > div > input',
          (elements) => elements.map((e) => e.getAttribute('class')),
        );

        const sa = (size, active) => {
          const map = new Map();
          for (let i = 0; i < size.length; i++) {
            map.set(size[i], active[i]);
          }
          return map;
        };

        console.log(sa(s, a));

        for (const size of sa(s, a)) {
          const status = size[1];
          const statusSubstring = 'noQtyAvailable';
          const result = sizes.find((arraySize) => {
            return arraySize.size === size[0];
          });
          console.log(result);
          console.log(status);
          if (!status.includes(statusSubstring)) {
            //in stock
            result.status = 1;
          }
          result.productName = articleName;
        }
        console.log(sizes);
        const product: HultaforsModel = {
          articleName: articleName,
          articleNumber: articleNumber,
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
}
