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
import { NeskridDto } from '../dto/product/neskrid.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { ScrapeDto } from '../dto/scrape/scrape.dto';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';
import { HultaforsService } from '../../core/service/hultafors.service';
import { HultaforsDto } from '../dto/product/hultafors.dto';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly neskridScraperService: NeskridScraperService,
    private readonly hultaForsScraperService: HultaforsScraperService,
    private readonly hultaforsService: HultaforsService,
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
          scrapeProducts = await this.hultaForsScraperService
            .scrapeHultafors(scraping.username, scraping.password)
            .catch((err) => {
              throw err;
            });
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

  /**
   * gets list of neskrid products
   */
  @UseGuards(jwtAuthenticationGuard)
  @Get('neskrid')
  async getAllNeskridProducts() {
    try {
      const products = await this.neskridScraperService.findAll();
      const productsDto: NeskridDto[] = products.map((product) => ({
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

  /**
   * gets list of hultafors products
   */
  @UseGuards(jwtAuthenticationGuard)
  @Get('hultafors')
  async getAllHultaforsProducts() {
    try {
      const products = await this.hultaforsService.findAllProducts();
      const productsDtos: HultaforsDto[] = products.map((product) => ({
        articleNumber: product.articleNumber,
        articleName: product.articleName,
        sizes: product.sizes.map((size) => ({
          size: size.size,
          status: size.status,
        })),
      }));

      return productsDtos;
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }
}
