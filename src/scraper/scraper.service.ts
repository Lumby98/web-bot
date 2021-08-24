import { Injectable } from '@nestjs/common';
import { ProductModel } from '../core/models/product.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../infrastructure/product.entity';
import { Repository } from 'typeorm';
import { Status } from '../enums/status.enum';

@Injectable()
export class ScraperService {
  puppeteer = require('puppeteer');
  fs = require('fs');

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   *  creates a new product in the database
   * @param productToCreate
   */
  async create(productToCreate: ProductModel): Promise<ProductModel> {
    let product = this.productRepository.create();
    product.brand = productToCreate.brandName;
    product.articleName = productToCreate.articleName;
    product.articleNo = productToCreate.articleNo;
    product.status = Status.NEW;
    product = await this.productRepository.save(product);
    return JSON.parse(JSON.stringify(product));
  }

  /**
   * finds all the products in the database
   */
  async findAll(): Promise<ProductModel[]> {
    const productE = await this.productRepository.find();
    if (productE) {
      return JSON.parse(JSON.stringify(productE));
    } else {
      throw new Error('could not find any products');
    }
  }

  /**
   * finds one product based on the brand and article name
   * @param articleName
   * @param brand
   */
  async findOne(brand: string, articleName: string): Promise<ProductModel> {
    const product: Product = await this.productRepository.findOne({
      brand: brand,
      articleName: articleName,
    });

    if (product) {
      return JSON.parse(JSON.stringify(product));
    } else {
      throw new Error('could not find the product');
    }
  }

  /**
   * updates a product
   * @param productToUpdate
   */
  async update(productToUpdate: ProductModel): Promise<ProductModel> {
    const productTU = await this.productRepository.findOne({
      brand: productToUpdate.brandName,
      articleName: productToUpdate.articleName,
    });
    if (productTU) {
      await this.productRepository.update(
        { articleName: productToUpdate.articleName },
        productToUpdate,
      );
      const updatedProduct = await this.productRepository.findOne({
        articleName: productToUpdate.articleName,
      });

      if (updatedProduct) {
        return JSON.parse(JSON.stringify(updatedProduct));
      } else {
        throw new Error('This product was not updated');
      }
    } else {
      throw new Error('this product does not exist');
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
  ): Promise<ProductModel[]> {
    //test in place for checking connection between frontend and backend (delete later)
    if (username == 'test' || password == 'test') {
      return [];
    }
    // Launch the browser
    const browser = await this.puppeteer.launch({ headless: false });

    try {
      // Creates a new instance of the page
      const page = await browser.newPage();

      // navigates to the web page (Neskrid)
      await page.goto('https://www.neskrid.com/').catch((err) => {
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
          err.message = 'could not find selector for language selection';
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
          '.ms-hero-bg-royal',
          { timeout: 5000 }, //waits a maximum of 5 seconds after pressing login
        )
        .catch((err) => {
          //if there is a timeout, it is assumed that the username or password is incorrect
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
        await page.waitForTimeout(1000);

        //clicks the next item in the list
        await page.type('.searchable-select-input', brand);
        await page.waitForTimeout(500);
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
          const product: ProductModel = {
            brandName: brand,
            articleName: articleName,
            articleNo: articleNo,
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
   * takes an array of products and writes it to a csv file
   * @param items =  []
   * @private
   */
  private writeToFile(items: ProductModel[]) {
    const file = this.fs.createWriteStream('testScrap.csv', 'utf-8');
    file.on('error', function (err) {
      throw err;
    });

    items.forEach(function (productModel) {
      file.write(
        productModel.brandName +
          ';' +
          productModel.articleName +
          ';' +
          productModel.articleNo +
          ';' +
          productModel.status.toString() +
          '\n',
      );
    });

    file.end();
  }

  public async createFile(products: ProductModel[]) {
    const completedList: ProductModel[] = [];
    try {
      for (const product of products) {
        let p: ProductModel;
        p = await this.findOne(product.brandName, product.articleName).catch(
          () =>
            (p = {
              brandName: 'placeholder',
              articleName: 'placeholder',
              articleNo: 'placeholder',
            }),
        );

        if (p.brandName !== 'placeholder') {
          if (p.status == Status.NEW) {
            product.status = Status.ACTIVE;
            await this.update(product);
            console.log(product);
          } else if (p.status == Status.INACTIVE) {
            product.status = Status.ACTIVE;
            await this.update(product);
            console.log(product);
          } else if (p.status == Status.ACTIVE) {
          }
          completedList.push(p);
        } else {
          p = await this.create(product);
          console.log(p);
          completedList.push(p);
        }
      }

      //this.writeToFile(completedList);
    } catch (err) {
      throw err;
    }
  }
}
