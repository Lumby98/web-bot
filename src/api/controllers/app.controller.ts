import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { ScraperService } from '../../core/services/scraper/scraper.service';

@Controller()
export class AppController {
  constructor(private scraperService: ScraperService) {}

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
      const done = { message: 'complete' };
      return done;
    } catch (err) {
      console.log(err);
      throw new HttpException(err, err.statusCode);
    }
  }
}
