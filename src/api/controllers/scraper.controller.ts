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
import { ScrapeDto } from '../dto/scrape/scrape.dto';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly neskridScraperService: NeskridScraperService,
    private readonly hultaForsService: HultaforsScraperService,
  ) {}

  /**
   * starts the scraper
   * @param scraping
   */
  @Post('scrape')
  @UseGuards(jwtAuthenticationGuard)
  async scrape(@Body() scraping: ScrapeDto) {
    try {
      if (!scraping.username || !scraping.password) {
        throw new HttpException(
          'incomplete login information',
          HttpStatus.NOT_FOUND,
        );
      }
      let scrapeProducts;
      switch (scraping.website) {
        case 'Neskrid': {
          scrapeProducts = await this.neskridScraperService
            .scrapNeskrid(scraping.username, scraping.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        case 'Hultafors': {
          scrapeProducts = await this.hultaForsService.scrapeHultafors(
            scraping.username,
            scraping.password,
          );
          return 'found Hultafors';
        }
        default: {
          throw new HttpException(
            'Website could not be found',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      //updates the list in the database using the returned list
      await this.neskridScraperService.updateAfterScrape(scrapeProducts);
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
      const products = await this.neskridScraperService.findAll();
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
