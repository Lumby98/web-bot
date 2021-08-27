import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ProductDTO } from './dto/product.dto';

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
        throw new HttpException(
          'incomplete login information',
          HttpStatus.NOT_FOUND,
        );
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

      await this.scraperService.updateAfterScrape(scrapeProducts);
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
        brand: product.brand,
        articleName: product.articleName,
        articleNo: product.articleNo,
        active: product.active,
      }));
      return productsDto;
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }
}
