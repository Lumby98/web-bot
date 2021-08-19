import { Injectable } from '@nestjs/common';

@Injectable()
export class ScraperService {
  puppeteer = require('puppeteer');
  fs = require('fs');

  /**
   * scraps Neskrid and writes to a file
   * @param username
   * @param password
   */
  public async scrapNeskrid(username: string, password: string) {
    // Launch the browser
    const browser = await this.puppeteer.launch({ headless: false });
    try {
      // Create an instance of the page
      const page = await browser.newPage();

      // Go to the web page (Neskrid)
      await page
        .goto('https://www.neskrid.com/', { timeout: 4000 })
        .catch((err) => {
          err.message = 'could not reach Neskrid';
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
          throw new Error(err);
        });

      //navigate to login
      await page.waitForSelector('.last a').catch((err) => {
        err.message = 'could not find selector for login button';
        throw new Error(err);
      });
      await page.click('.last a');

      //login
      await page.waitForSelector('#gebruikerscode').catch((err) => {
        err.message = 'could not find selector for input field for username';
        throw new Error(err);
      });
      await page.type('#gebruikerscode', username);
      await page.type('#gebruikerspass', password).catch((err) => {
        err.message = 'could not find selector for input field for password';
        throw new Error(err);
      });
      await page.click('.login-form button').catch((err) => {
        err.message = 'could not find selector for login button';
        throw new Error(err);
      });

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
          throw new Error(err);
        });
      await page.click('.card.card-yellow.animated.fadeInUp.animation-delay-7');
      await page.waitForSelector('.col-sm-9');
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

      // get the different products
      const products = [];
      for (const brand of brands) {
        const dataValue = brand.brandValue;
        console.log('[data-value*="' + dataValue + '"]');
        await page.waitForSelector('.searchable-select-caret');
        await page.click('.searchable-select-caret');
        await page.waitForSelector('.searchable-select-holder');
        await page.click('.searchable-select-holder');
        await page.waitForSelector('div[data-value*="' + dataValue + '"]');
        await page.click('div[data-value*="' + dataValue + '"]');
        await page.waitForSelector('.input-container');
        const articleName = await page.$$eval(
          '.radio-tile-label',
          (label) => label.textContent,
        );
        console.log(articleName);
        let articleNo = await page.$$eval(
          '.card-block.pt-4.text-center small',
          (small) => small.textContent,
        );
        const splitter = articleNo.split(':');
        articleNo = splitter[1];
        console.log(articleNo);

        for (let i = 0; i < brandValues.length; i++) {
          const articleName = '';
          const articleNo = '';
          const brandName = '';
          const product = { articleName, articleNo, brandName };
          product.articleName = articleName[i];
          product.articleNo = articleNo[i];
          product.brandName = brand.brandName;
          products.push(product);
        }
      }

      //writes the list of products to an csv file
      this.fs.writeFile(
        'testScrap.csv',
        'brand ; articleName ; articleNo',
        function (err) {
          if (err) return console.log(err);
        },
      );
      for (const product of products) {
        this.fs.write(
          'testScrap.csv',
          product.brandName +
            ' ; ' +
            product.articleName +
            ' ; ' +
            product.articleNo,
          function (err) {
            if (err) return console.log(err);
          },
        );
      }

      // We close the browser
      await browser.close();

      return products;
    } catch (err) {
      console.log(err.message);
      throw err;
    } finally {
      await browser.close();
    }
  }
}
