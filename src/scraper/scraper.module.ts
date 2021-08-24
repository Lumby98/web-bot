import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../infrastructure/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
