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

      // Go to the web page that we want to scrap
      await page
        .goto('https://www.neskrid.com/', { timeout: 3000 })
        .catch((err) => {
          err.message = 'could not reach Neskrid';
          throw new Error(err);
        });

      await page
        .waitForSelector(
          '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
        )
        .catch((err) => {
          err.message = 'could not find selector for login button';
          throw new Error(err);
        });

      //navigate to login
      await page.click(
        '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      );

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
      await page.waitForTimeout(4000);
      await page.click('.card.card-yellow.animated.fadeInUp.animation-delay-7');
      await page.waitForSelector('.col-sm-9');
      await page.click('.searchable-select-holder');

      // get the different brands in the dropdown menu

      const products = [];
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

      for (const brand of brands) {
        const dataValue = brand.brandValue;
        console.log('[data-value="' + dataValue + '"]');
        await page.waitForSelector('.modal-header');
        await page.click('.modal-header');
        await page.waitForSelector('.searchable-select-holder');
        await page.click('.searchable-select-holder');
        await page.waitForSelector('div[data-value="' + dataValue + '"]');
        await page.click('div[data-value="' + dataValue + '"]');
        const data = await page.evaluate(() => {
          const articleName = document
            .querySelector(
              '.radio-tile.card.card-yellow .card-block.pt-4.text-center h5',
            )
            .textContent.toString();
          let articleNo = document
            .querySelector(
              '.radio-tile.card.card-yellow .card-block.pt-4.text-center small',
            )
            .textContent.toString();
          const splitter = articleNo.split(':');
          articleNo = splitter[1].trim();
          const productBrand = brand.brandNames;
          return {
            productBrand,
            articleName,
            articleNo,
          };
        });
        products.push(data);
      }
      console.log(brandNames);

      /*
      // Here we can select elements from the web page
      const data = await page.evaluate(() => {
        const brand = document
          .querySelector('.author-title')
          .textContent.toString();
        const articleName = document
          .querySelector('.author-born-date')
          .textContent.toString();
        const articleNo = document
          .querySelector('.author-born-location')
          .textContent.toString();
        // This object will be stored in the data variable
        return {
          brand,
          articleName,
          articleNo,
        };
      });

      this.fs.writeFile(
        'testScrap.csv',
        data.brand + ' ; ' + data.articleName + ' ; ' + data.articleNo,
        function (err) {
          if (err) return console.log(err);
        },
      );

      // We close the browser
      await browser.close();*/
    } catch (err) {
      console.log(err.message);
      throw err;
    } finally {
      //await browser.close();
    }
  }
}
