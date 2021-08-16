import { Controller, Get, HttpException } from '@nestjs/common';
import { ScraperService } from '../../core/services/scraper/scraper.service';

@Controller()
export class AppController {
  constructor(private scraperService: ScraperService) {}

  @Get('scrap')
  async scrap() {
    /* if (!username || !password) {
      throw new HttpException('incomplete login information', 400);
    }*/
    await this.scraperService.scrap('username', 'password');
  }
}
