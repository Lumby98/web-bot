import { CreateLogDto } from './create-log.dto';

export interface UpdateLogDto extends CreateLogDto {
  id: number;
}
