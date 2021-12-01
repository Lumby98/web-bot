import { LogModel } from './log.model';

export interface OrderLogModel {
  id: number;
  orderNr: string;
  completed: boolean;
  logs: LogModel[];
}
