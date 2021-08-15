import { Injectable } from '@nestjs/common';
//import * as puppeteer from 'puppeteer';
// import fs from 'fs';

@Injectable()
export class ScraperService {
  puppeteer = require('puppeteer');
  fs = require('fs');

  public async scrap() {
    try {
      // Launch the browser
      const browser = await this.puppeteer.launch();
      // Create an instance of the page
      const page = await browser.newPage();
      // Go to the web page that we want to scrap
      await page.goto(
        'https://www.imdb.com/title/tt1700841/?ref_=nv_sr_srsg_4',
      );

      // Here we can select elements from the web page
      const data = await page.evaluate(() => {
        const title = document
          .querySelector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.TitleBlock__Container-sc-1nlhx7j-0.hglRHk > div.TitleBlock__TitleContainer-sc-1nlhx7j-1.jxsVNt > h1')
          .textContent.toString();
        const summary = document
          .querySelector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.Hero__MediaContentContainer__Video-kvkd64-2.kmTkgc > div.Hero__ContentContainer-kvkd64-10.eaUohq > div.Hero__MetaContainer__Video-kvkd64-4.kNqsIK > div.GenresAndPlot__ContentParent-cum89p-8.bFvaWW.Hero__GenresAndPlotContainer-kvkd64-11.twqaW > p > span.GenresAndPlot__TextContainerBreakpointXL-cum89p-2.gCtawA')
          .textContent.toString();
        // This object will be stored in the data variable
        return {
          title,
          summary,
        };
      });

      this.fs.writeFile(
        'testScrap.csv',
        data.title + ';' + data.summary,
        function (err) {
          if (err) return console.log(err);
        },
      );

      // We close the browser
      await browser.close();
    } catch (err) {
      console.log(err);
    }
  }
}
