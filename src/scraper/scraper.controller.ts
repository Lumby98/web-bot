import { Controller, Get, Query, HttpException, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ProductModel } from '../models/product.model';
import { ProductDTO } from './dto/product.dto';
import { Status } from '../enums/status.enum';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('scrap')
  async scrap(
    @Query('username') username: string,
    @Query('password') password: string,
  ) {
    try {
      if (!username || !password) {
        throw new HttpException('incomplete login information', 404);
      }
      const scrapeProducts = await this.scraperService
        .scrapNeskrid(username, password)
        .catch((err) => {
          throw err;
        });

      //for testing connection (delete later)
      if (scrapeProducts.length == 0) {
        return { message: 'test done' };
      }

      const completedList = await this.scraperService.updateAfterScrape(
        scrapeProducts,
      );
      return { message: 'complete' };
    } catch (err) {
      console.log(err);
      throw new HttpException(err, err.statusCode);
    }
  }

  @Get()
  async getAllProducts() {
    try {
      const products = await this.scraperService.findAll();
      const productsDto: ProductDTO[] = products.map((product) => ({
        articleName: product.articleName,
        articleNo: product.articleNo,
        brand: product.brand,
        status: product.status,
      }));
      return productsDto;
    } catch (err) {
      throw new HttpException(err, 404);
    }
  }
}
