import { InsoleFromSheetDto } from './insole-from-sheet.dto';

export class RegisterInsoleDto {
  username: string;
  password: string;
  insoles: InsoleFromSheetDto[];
}
