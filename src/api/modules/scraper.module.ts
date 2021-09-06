import { Module } from '@nestjs/common';
import { ScraperService } from '../../core/service/scraper.service';
import { ScraperController } from '../controllers/scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NeskridProduct])],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
