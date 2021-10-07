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
import { NeskridService } from '../../core/service/neskrid.service';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly neskridScraperService: NeskridScraperService,
    private readonly hultaForsScraperService: HultaforsScraperService,
    private readonly hultaforsService: HultaforsService,
    private readonly siteService: SiteService,
    private readonly neskridService: NeskridService,
  ) {}

  /**
   * creates a site
   * @param site
   */
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
      //checks if username or password is blank if true throw error
      if (!scraping.username || !scraping.password) {
        throw new HttpException(
          'incomplete login information',
          HttpStatus.NOT_FOUND,
        );
      }
      let scrapedProducts;
      //switch case determining which site should be scrapped
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

      //updates the lastedScraped for the given site
      const sites = await this.siteService.updateSiteAfterScrape(
        scraping.website,
      );
      //returns a message and the updated site
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
      const products = await this.neskridService.findAll();
      let productDtos: NeskridDto[] = products.map((product) => ({
        brand: product.brand,
        articleName: product.articleName,
        articleNo: product.articleNo,
        active: product.active,
      }));
      //sorts the list brand and article name
      productDtos = productDtos.sort((a, b) => {
        if (a.brand === b.brand) {
          return a.articleName < b.articleName ? -1 : 1;
        } else {
          return a.brand < b.brand ? -1 : 1;
        }
      });
      return productDtos;
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
      let productDtos: HultaforsDto[] = products.map((product) => ({
        articleNumber: product.articleNumber,
        articleName: product.articleName,
        sizes: product.sizes.map((size) => ({
          size: size.size,
          status: size.status,
          date: size.date,
        })),
      }));
      //sorts list by article name and number
      productDtos = productDtos.sort((a, b) => {
        if (a.articleName === b.articleName) {
          return a.articleNumber < b.articleNumber ? -1 : 1;
        } else {
          return a.articleName < b.articleName ? -1 : 1;
        }
      });
      return productDtos;
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }

  /**
   * gets all sites
   */
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
