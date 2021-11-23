import { SizeModel } from './size.model';

export interface HultaforsModel {
  id?: string;
  articleNumber: string;
  articleName: string;
  sizes: SizeModel[];
}
