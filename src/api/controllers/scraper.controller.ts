import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { ScraperService } from '../../core/service/scraper.service';
import { ProductDTO } from '../dto/product/product.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { LoginDto } from '../dto/user/login.dto';
import { log } from 'util';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('scrape')
  @UseGuards(jwtAuthenticationGuard)
  async scrap(@Body() loginDto: LoginDto) {
    try {
      if (!loginDto.username || !loginDto.password) {
        throw new HttpException(
          'incomplete login information',
          HttpStatus.NOT_FOUND,
        );
      }
      const scrapeProducts = await this.scraperService
        .scrapNeskrid(loginDto.username, loginDto.password)
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

  @UseGuards(jwtAuthenticationGuard)
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
