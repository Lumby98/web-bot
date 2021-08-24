import { Controller, Get, Query, HttpException } from '@nestjs/common';
import { ScraperService } from './scraper.service';

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
      const products = await this.scraperService
        .scrapNeskrid(username, password)
        .catch((err) => {
          throw err;
        });
      console.log(products);
      return { message: 'complete' };
    } catch (err) {
      console.log(err);
      throw new HttpException(err, err.statusCode);
    }
  }
}
