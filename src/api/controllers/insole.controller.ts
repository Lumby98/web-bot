import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InsoleService } from '../../core/service/insole.service';
import { InsoleFromSheetDto } from '../dto/insole-upload/insole-from-sheet.dto';
@Controller('insole')
export class InsoleController {
  constructor(private readonly insoleService: InsoleService) {}

  @Post()
  create(@Body() createInsoleDto: InsoleFromSheetDto) {
    return this.insoleService.create(createInsoleDto);
  }

  @Get()
  findAll() {
    return this.insoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insoleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInsoleDto: InsoleFromSheetDto) {
    return this.insoleService.update(+id, updateInsoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.insoleService.remove(+id);
  }
}
