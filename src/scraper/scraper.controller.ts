import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { CreateScraperDto } from './dto/create-scraper.dto';
import { UpdateScraperDto } from './dto/update-scraper.dto';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  create(@Body() createScraperDto: CreateScraperDto) {
    return this.scraperService.create(createScraperDto);
  }

  @Get()
  findAll() {
    return this.scraperService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scraperService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScraperDto: UpdateScraperDto) {
    return this.scraperService.update(+id, updateScraperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scraperService.remove(+id);
  }

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
