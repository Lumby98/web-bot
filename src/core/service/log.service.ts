import { Injectable } from '@nestjs/common';
import { CreateLogDto } from '../../ui.api/dto/log/create-log.dto';
import { UpdateLogDto } from '../../ui.api/dto/log/update-log.dto';
import { LogInterface } from '../interfaces/log.interface';

@Injectable()
export class LogService implements LogInterface {
  create(createLogDto: CreateLogDto) {
    return 'This action adds a new log';
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
