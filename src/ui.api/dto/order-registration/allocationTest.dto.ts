import { OrderWithLogs } from '../../../core/models/orderWithLogs';

export class AllocationTestDto {
  orderWithLogs: OrderWithLogs;
  username: string;
  password: string;
  dev: boolean;
  completeOrder: boolean;
  year: number;
  month: number;
  date: number;
  dateBuffer?: number;
}
