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
        throw new HttpException('incomplete login information', 400);
      }
      const products = await this.scraperService
        .scrapNeskrid(username, password)
        .catch((err) => {
          throw err.message;
        });
      return 'scrap successful';
    } catch (err) {
      console.log(err);
      throw new HttpException(err, 404);
    }
  }
}
