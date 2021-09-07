import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { ProductDTO } from '../dto/product/product.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { LoginDto } from '../dto/user/login.dto';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: NeskridScraperService) {}

  /**
   * starts the scraper
   * @param loginDto
   */
  @Post('scrape')
  @UseGuards(jwtAuthenticationGuard)
  async scrap(@Body() loginDto: LoginDto) {
    try {
      //checks if there is a username and password
      if (!loginDto.username || !loginDto.password) {
        throw new HttpException(
          'incomplete login information',
          HttpStatus.NOT_FOUND,
        );
      }
      //starts scraping
      const scrapeProducts = await this.scraperService
        .scrapNeskrid(loginDto.username, loginDto.password)
        .catch((err) => {
          throw err;
        });

      //updates the list in the database using the returned list
      await this.scraperService.updateAfterScrape(scrapeProducts);
      return { message: 'complete' };
    } catch (err) {
      console.log(err);
      throw new HttpException(err, err.statusCode);
    }
  }

  // gets list of products
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
