import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NeskridModel } from '../models/neskrid.model';
import { InjectRepository } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { Repository } from 'typeorm';
import { HultaforsModel } from '../models/hultafors.model';

@Injectable()
export class NeskridScraperService {
  puppeteer = require('puppeteer');

  constructor(
    @InjectRepository(NeskridProduct)
    private productRepository: Repository<NeskridProduct>,
  ) {}

  /**
   *  creates a new product in the database
   * @param productToCreate
   */
  async create(productToCreate: NeskridModel): Promise<NeskridModel> {
    try {
      //checks if the product already exists
      const check = await this.productRepository.findOne({
        brand: productToCreate.brand,
        articleName: productToCreate.articleName,
      });

      if (check) {
        throw new HttpException('product already exists', HttpStatus.FOUND);
      }
      //makes sure the the active variable is either 1 or 0
      if (productToCreate.active > 1 || productToCreate.active < 0) {
        throw new HttpException(
          'active needs to be 1 or 0',
          HttpStatus.BAD_REQUEST,
        );
      }
      //creates and retruns the product
      let product: NeskridProduct = this.productRepository.create();
      product.brand = productToCreate.brand;
      product.articleName = productToCreate.articleName;
      product.articleNo = productToCreate.articleNo;
      product.active = productToCreate.active;
      product = await this.productRepository.save(product);
      return JSON.parse(JSON.stringify(product));
    } catch (err) {
      throw err;
    }
  }

  /**
   * finds all the products in the database
   */
  async findAll(): Promise<NeskridModel[]> {
    try {
      const productE: NeskridProduct[] = await this.productRepository.find();
      if (productE) {
        return JSON.parse(JSON.stringify(productE));
      } else {
        throw new HttpException(
          'could not find any products',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * finds one product based on the brand and article name
   * @param articleName
   * @param brand
   */
  async findOne(brand: string, articleName: string): Promise<NeskridModel> {
    try {
      const product: NeskridProduct = await this.productRepository.findOne({
        brand: brand,
        articleName: articleName,
      });

      if (product) {
        return JSON.parse(JSON.stringify(product));
      } else {
        throw new HttpException(
          'could not find the product',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * updates a product
   * @param productToUpdate
   */
  async update(productToUpdate: NeskridModel): Promise<NeskridModel> {
    try {
      const productTU: NeskridProduct = await this.productRepository.findOne({
        brand: productToUpdate.brand,
        articleName: productToUpdate.articleName,
      });
      if (productTU) {
        await this.productRepository.update(
          { id: productTU.id },
          productToUpdate,
        );
        const updatedProduct = await this.productRepository.findOne({
          articleName: productToUpdate.articleName,
        });

        if (updatedProduct) {
          return JSON.parse(JSON.stringify(updatedProduct));
        } else {
          throw new HttpException(
            'This product was not updated',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'this product does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * scraps Neskrid and writes to a file
   * @param username = string
   * @param password = string
   */
  public async scrapNeskrid(
    username: string,
    password: string,
  ): Promise<NeskridModel[]> {
    //test in place for checking connection between frontend and backend (delete later)
    if (username == 'test' || password == 'test') {
      return [];
    }
    // Launch the browser (use {headless: false} in the launch method, to see how puppeteer navigates)
    const browser = await this.puppeteer.launch();

    try {
      // Creates a new instance of the page
      const page = await browser.newPage();

      // navigates to the web page (Neskrid)
      await page.goto('https://www.neskrid.com/').catch(() => {
        throw new HttpException(
          'could not reach Neskrid',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      });

      await page.waitForSelector(
        '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
      );

      //set language on page
      await page
        .click(
          '#modallanguages > div > div > div.modal-body.text-center > ul > li:nth-child(1) > a',
        )
        .catch(() => {
          throw new HttpException(
            'could not find selector for language selection',
            HttpStatus.GATEWAY_TIMEOUT,
          );
        });

      //navigate to login
      await page.waitForSelector('.last a').catch(() => {
        throw new HttpException(
          'could not find selector for login button',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      });
      await page.click('.last a');

      //login
      await page.waitForSelector('#gebruikerscode').catch(() => {
        throw new HttpException(
          'could not find selector for input field for username',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      });

      await page.type('#gebruikerscode', username);
      await page.type('#gebruikerspass', password).catch(() => {
        throw new HttpException(
          'could not find selector for input field for password',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      });

      await page.click('.login-form button').catch(() => {
        throw new HttpException(
          'could not find selector for login button',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      });
      await page.waitForTimeout(2000);

      //navigate to scraping content
      await page
        .waitForSelector(
          '.ms-hero-bg-royal',
          { timeout: 5000 }, //waits a maximum of 5 seconds after pressing login
        )
        .catch(() => {
          //if there is a timeout, it is assumed that the username or password is incorrect
          throw new HttpException(
            'failed to login username or password might be incorrect',
            HttpStatus.GATEWAY_TIMEOUT,
          );
        });

      await page.click(
        '.card.card-yellow.animated.fadeInUp.animation-delay-7 .ms-hero-bg-royal',
      );
      await page.waitForSelector('.searchable-select-holder', {
        timeout: 5000,
      });
      await page.click('.searchable-select-holder');

      // get the different brands in the dropdown menu
      let brandNames = await page.$$eval('.searchable-select-item', (items) =>
        items.map((item) => item.innerHTML),
      );

      brandNames = brandNames.filter((obj) => obj !== brandNames[0]);
      //console.log(brands);

      //closes dropdown menu
      await page.waitForSelector('.searchable-select-caret');
      await page.click('.searchable-select-caret');

      // get the different products
      const products = [];
      for (const brand of brandNames) {
        //opens dropdown menu
        await page.waitForSelector('.searchable-select-holder');
        await page.click('.searchable-select-holder');
        await page.waitForTimeout(500);

        //clicks the next item in the list
        await page.type('.searchable-select-input', brand);
        await page.keyboard.press('Enter');

        //gets the article names for the current brand
        await page.waitForSelector('.input-container');
        const articles = await page.$$('.input-container');
        //console.log(articles);

        //gets the article number for the current brand
        for (const article of articles) {
          const articleName = await article.$eval(
            '.color-primary',
            (el) => el.textContent,
          );
          let articleNo = '';
          articleNo = await article
            .$eval('small', (el) => el.textContent)
            .catch(() => {
              articleNo = 'h:no article number';
            });
          if (articleNo == undefined) {
            articleNo = 'h:no article number';
          }
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
      }

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
   * updates the database table by comparing the different them with the given list
   * @param products = []
   */
  public async updateAfterScrape(
    products: NeskridModel[],
  ): Promise<NeskridModel[]> {
    const completedList: NeskridModel[] = [];
    try {
      const productsInDatabase = await this.findAll();

      for (const product of products) {
        let p: NeskridModel;
        p = productsInDatabase.find(
          (x) =>
            x.brand === product.brand && x.articleName === product.articleName,
        );
        if (p) {
          if (product.active == 1 && p.active == 1) {
            completedList.push(p);
          } else if (product.active == 0 && p.active == 0) {
            completedList.push(p);
          } else if (product.active == 1 && p.active == 0) {
            p.active = 1;
            p = await this.update(p);
            completedList.push(p);
          } else {
            p.active = 0;
            p = await this.update(p);
            completedList.push(p);
          }
        } else {
          p = await this.create(product).catch(() => (p = undefined));
          if (p) {
            completedList.push(p);
          }
        }
      }
      const missing: NeskridModel[] = productsInDatabase.filter(
        (x) => !completedList.includes(x),
      );
      if (missing) {
        for (let x of missing) {
          x.active = 0;
          x = await this.update(x);
          completedList.push(x);
        }
      }

      return completedList;
    } catch (err) {
      throw err;
    }
  }
}
