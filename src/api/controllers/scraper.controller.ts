import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { NeskridDto } from '../dto/product/neskrid.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { ScrapeDto } from '../dto/scrape/scrape.dto';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';
import { HultaforsService } from '../../core/service/hultafors.service';
import { HultaforsDto } from '../dto/product/hultafors.dto';
import { SiteService } from '../../core/service/site.service';
import { SiteDto } from '../dto/site/site.dto';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly neskridScraperService: NeskridScraperService,
    private readonly hultaForsScraperService: HultaforsScraperService,
    private readonly hultaforsService: HultaforsService,
    private readonly siteService: SiteService,
  ) {}

  @Post('siteCreate')
  async createSite(@Body() site: SiteDto) {
    return await this.siteService.createSite(site);
  }

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
      let scrapedProducts;
      switch (scraping.website) {
        case 'Neskrid': {
          scrapedProducts = await this.neskridScraperService
            .scrapNeskrid(scraping.username, scraping.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        case 'Hultafors': {
          scrapedProducts = await this.hultaForsScraperService
            .scrapeHultafors(scraping.username, scraping.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        default: {
          throw new HttpException(
            'Website could not be found',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      //updates the lasted scraped for the given site
      const sites = await this.siteService.updateSiteAfterScrape(
        scraping.website,
      );
      return { message: 'complete', sites };
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
          date: size.date,
        })),
      }));

      return productsDtos;
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }

  @UseGuards(jwtAuthenticationGuard)
  @Get('sites')
  async getSites(): Promise<SiteDto[]> {
    try {
      const sites = await this.siteService.findSites();
      return JSON.parse(JSON.stringify(sites));
    } catch (err) {
      throw new HttpException(err, HttpStatus.NOT_FOUND);
    }
  }
}
