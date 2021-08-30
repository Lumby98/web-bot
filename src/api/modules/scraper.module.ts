import { Module } from '@nestjs/common';
import { ScraperService } from '../../core/service/scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../infrastructure/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
