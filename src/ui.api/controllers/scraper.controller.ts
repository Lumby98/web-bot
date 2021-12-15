import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NeskridDto } from '../dto/product/neskrid.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { ScrapeDto } from '../dto/scrape/scrape.dto';
import { HultaforsDto } from '../dto/product/hultafors.dto';
import { SiteDto } from '../dto/site/site.dto';
import {
  NeskridScraperInterface,
  neskridScraperInterfaceProvider,
} from '../../core/interfaces/neskrid-scraper.interface';
import {
  HultaforsScraperInterface,
  hultaforsScraperInterfaceProvider,
} from '../../core/interfaces/hultafors-scraper.interface';
import {
  HultaforsInterface,
  hultaforsInterfaceProvider,
} from '../../core/interfaces/hultafors.interface';
import {
  SiteInterface,
  siteInterfaceProvider,
} from '../../core/interfaces/site.interface';
import {
  NeskridInterface,
  neskridInterfaceProvider,
} from '../../core/interfaces/neskrid.interface';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { NeskridModel } from '../../core/models/neskrid.model';
import { LoginTypeEnum } from '../../core/enums/loginType.enum';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../../core/interfaces/savedLoginService.interface';

@Controller('scraper')
export class ScraperController {
  constructor(
    @Inject(neskridScraperInterfaceProvider)
    private readonly neskridScraperService: NeskridScraperInterface,
    @Inject(hultaforsScraperInterfaceProvider)
    private readonly hultaForsScraperService: HultaforsScraperInterface,
    @Inject(hultaforsInterfaceProvider)
    private readonly hultaforsService: HultaforsInterface,
    @Inject(siteInterfaceProvider) private readonly siteService: SiteInterface,
    @Inject(neskridInterfaceProvider)
    private readonly neskridService: NeskridInterface,
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
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
  @UseGuards(jwtAuthenticationGuard)
  @Post('scrape')
  async scrape(@Body() scraping: ScrapeDto) {
    try {
      const neskridLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.NESKRID,
        scraping.key,
      );

      const hultaforsLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.HULTAFORS,
        scraping.key,
      );
      let scrapedProducts;
      //switch case determining which site should be scrapped
      switch (scraping.website) {
        case 'Neskrid': {
          scrapedProducts = await this.neskridScraperService
            .scrapNeskrid(neskridLogin.username, neskridLogin.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        case 'Hultafors': {
          scrapedProducts = await this.hultaForsScraperService
            .scrapeHultafors(hultaforsLogin.username, hultaforsLogin.password)
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

  @UseGuards(jwtAuthenticationGuard)
  @Post('createAll')
  async createAll(@Body() neskridModels: NeskridModel[]) {
    try {
      const products = await this.neskridService.createAll(neskridModels);

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
      console.log(err);
      throw new HttpException(err, err.statusCode);
    }
  }

  @UseGuards(jwtAuthenticationGuard)
  @Put('updateAll')
  async updateAll(@Body() neskridModels: NeskridModel[]) {
    try {
      const products = await this.neskridService.updateAll(neskridModels);

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
      //test
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
