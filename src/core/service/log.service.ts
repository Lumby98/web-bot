import { Injectable } from '@nestjs/common';
import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';
import { UpdateLogDto } from '../../ui.api/dto/log/logEntry/update-log.dto';
import { LogInterface } from '../interfaces/log.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogService implements LogInterface {
  constructor(
    @InjectRepository(LogEntity)
    private logRepository: Repository<LogEntity>,
  ) {}

  /**
   *
   * @param createLogDto
   */
  create(createLogDto: CreateLogDto) {
    return 'This action adds a new logEntry';
  }

  findAll() {
    return `This action returns all log`;
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
