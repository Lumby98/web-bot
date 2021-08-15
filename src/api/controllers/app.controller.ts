import { Controller, Get } from '@nestjs/common';
import { ScraperService } from '../../core/services/scraper/scraper.service';

@Controller()
export class AppController {
  constructor(private scraperService: ScraperService) {}

  @Get('scrap')
  async scrap() {
    await this.scraperService.scrap();
  }
}
