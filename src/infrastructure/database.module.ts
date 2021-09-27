import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NeskridProduct } from './entities/neskrid.product.entity';
import { User } from './entities/user.entity';
import { HultaforsProduct } from './entities/hultafors.product.entity';
import { Size } from './entities/size.entity';
import { Site } from './entities/site.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [NeskridProduct, User, HultaforsProduct, Size, Site],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
