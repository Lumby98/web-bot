import { Injectable } from '@nestjs/common';
import { InsoleFromSheetDto } from '../../api/dto/insole-upload/insole-from-sheet.dto';

@Injectable()
export class InsoleService {
  create(createInsoleDto: InsoleFromSheetDto) {
    return 'This action adds a new insole';
  }

  findAll() {
    return `This action returns all insole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} insole`;
  }

  update(id: number, updateInsoleDto: InsoleFromSheetDto) {
    return `This action updates a #${id} insole`;
  }

  remove(id: number) {
    return `This action removes a #${id} insole`;
  }
}
