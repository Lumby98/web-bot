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
    try {
      // Launch the browser
      const browser = await this.puppeteer.launch({ headless: false });
      // Create an instance of the page
      const page = await browser.newPage();
      const client = await page.target().createCDPSession();
      await client.send('Network.emulateNetworkConditions', {
        offline: true,
        downloadThroughput: 500,
        uploadThroughput: 500,
        latency: 20,
      });

      // Go to the web page that we want to scrap
      await page
        .goto('https://quotes.toscrape.com', { timeout: 3000 })
        .catch((err) => {
          throw new err('something went wrong, neskrid might be down');
        });
      await page.waitForSelector(
        'body > div > div.row.header-box > div.col-md-4 > p > a',
      );

      //navigate to login
      await page.click(
        'body > div > div.row.header-box > div.col-md-4 > p > a',
      );

      //login
      await page.waitForSelector('#username');
      await page.type('#username', username);
      await page.type('#password', password);
      await page.click('.btn.btn-primary');

      //navigate to scraping content
      await page.waitForSelector(
        'body > div > div:nth-child(2) > div.col-md-8 > div:nth-child(1) > span:nth-child(2) > a',
      );
      await page.click(
        'body > div > div:nth-child(2) > div.col-md-8 > div:nth-child(1) > span:nth-child(2) > a',
      );
      await page.waitForSelector('.author-title');

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
      await browser.close();
    } catch (err) {
      throw err;
    }
  }
}
