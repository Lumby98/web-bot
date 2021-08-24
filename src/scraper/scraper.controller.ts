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
      const scrapeProducts = await this.scraperService
        .scrapNeskrid(username, password)
        .catch((err) => {
          throw err;
        });

      //for testing connection (delete later)
      if (scrapeProducts.length == 0) {
        return { message: 'test done' };
      }

      await this.scraperService.createFile(scrapeProducts);
      return { message: 'complete' };
    } catch (err) {
      console.log(err);
      throw new HttpException(err, err.statusCode);
    }
  }
}
