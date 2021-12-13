import { LogModel } from './log.model';

export interface ErrorLogModel {
  id: number;
  errorMessage: string;
  displayErrorMessage?: string;
  logs: LogModel[];
}
