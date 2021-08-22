import { Injectable } from '@nestjs/common';
import { ProductModel } from '../../models/product.model';
import { keyDefinitions } from 'puppeteer';
import { timeout } from "rxjs/operators";

@Injectable()
export class ScraperService {
  puppeteer = require('puppeteer');
  fs = require('fs');

  /**
   * scraps Neskrid and writes to a file
   * @param username = string
   * @param password = string
   */
  public async scrapNeskrid(username: string, password: string) {
    //test in place for checking connection between frontend and backend (delete later)
    if (username == 'test' || password == 'test') {
      return 'done';
    }
    // Launch the browser
    const browser = await this.puppeteer.launch({ headless: false });

    try {
      // Creates a new instance of the page
      const page = await browser.newPage();

      // navigates to the web page (Neskrid)
      await page
        .goto('https://www.neskrid.com/', { timeout: 4000 })
        .catch((err) => {
          err.message = 'could not reach Neskrid';
          err.statusCode = 504;
          throw new Error(err);
        });

      await page.waitForSelector(
        '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      );

      //set language on the page
      await page
        .click(
          '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
        )
        .catch((err) => {
          err.message = 'could not find selector for login button';
          err.statusCode = 504;
          throw new Error(err);
        });

      //navigate to login
      await page.waitForSelector('.last a').catch((err) => {
        err.message = 'could not find selector for login button';
        err.statusCode = 504;
        throw new Error(err);
      });
      await page.click('.last a');

      //login
      await page.waitForSelector('#gebruikerscode').catch((err) => {
        err.message = 'could not find selector for input field for username';
        err.statusCode = 504;
        throw new Error(err);
      });

      await page.type('#gebruikerscode', username);
      await page.type('#gebruikerspass', password).catch((err) => {
        err.message = 'could not find selector for input field for password';
        err.statusCode = 504;
        throw new Error(err);
      });

      await page.click('.login-form button').catch((err) => {
        err.message = 'could not find selector for login button';
        err.statusCode = 504;
        throw new Error(err);
      });
      await page.waitForTimeout(5000);

      //navigate to scraping content
      await page
        .waitForSelector(
          '.card.card-yellow.animated.fadeInUp.animation-delay-7',
          { timeout: 10000 }, //waits a maximum of 10 seconds after pressing login
        )
        .catch((err) => {
          //if timeout it is assumed that the username or password is incorrect
          err.message =
            'failed to login username or password might be incorrect';
          err.statusCode = 504;
          throw new Error(err);
        });

      await page.click(
        '.card.card-yellow.animated.fadeInUp.animation-delay-7 .ms-hero-bg-royal',
      );
      await page.waitForSelector('.searchable-select-holder');
      await page.click('.searchable-select-holder');

      // get the different brands in the dropdown menu
      const brandValues = await page.$$eval(
        '.searchable-select-item',
        (items) => items.map((item) => item.dataset.value),
      );
      const brandNames = await page.$$eval('.searchable-select-item', (items) =>
        items.map((item) => item.innerHTML),
      );

      const brands = [];
      for (let i = 1; i < brandValues.length; i++) {
        const brandName = '';
        const brandValue = '';

        const newBrand = { brandValue, brandName };

        newBrand.brandValue = brandValues[i];
        newBrand.brandName = brandNames[i];

        brands.push(newBrand);
      }

      //closes dropdown menu
      await page.waitForSelector('.searchable-select-caret');
      await page.click('.searchable-select-caret');

      // get the different products
      const products = [];
      for (const brand of brands) {
        const dataValue = brand.brandValue;

        //opens dropdown menu
        await page.waitForSelector('.searchable-select-holder');
        await page.click('.searchable-select-holder');

        //clicks the next item in the list
        await page.waitForSelector('div[data-value*="' + dataValue + '"]');
        await page.click('div[data-value*="' + dataValue + '"]');

        //gets the article names for the current brand
        await page.waitForSelector('.input-container');
        const articleNames = await page.$$eval('.radio-tile-label', (labels) =>
          labels.map((label) => label.textContent),
        );
        console.log(articleNames.length);

        //gets the article number for the current brand
        const articleNos = await page.$$eval(
          '.card-block.pt-4.text-center small',
          (smalls) => smalls.map((small) => small.textContent),
        );
        console.log(articleNos.length);

        //creates a product and pushes it to the products list
        for (let i = 0; i < articleNames.length; i++) {
          const product: ProductModel = {
            brandName: brand.brandName,
            articleName: articleNames[i],
            articleNo: articleNos[i],
          };
          products.push(product);
        }
      }

      //console.log(products);
      //this.writeToFile(products);

      // We close the browser
      await browser.close();

      // return the list of products
      return products;
    } catch (err) {
      console.log(err.message);
      throw err;
    } finally {
      await browser.close();
    }
  }

  /**
   * takes an array of products and writes it to a csv file
   * @param items =  []
   * @private
   */
  private writeToFile(items: ProductModel[]) {
    const file = this.fs.createWriteStream('testScrap.csv');
    file.on('error', function (err) {
      throw err;
    });

    items.forEach(function (v) {
      file.write(v.brandName + ';' + v.articleName + ';' + v.articleNo + '\n');
    });

    file.end();
  }
}
