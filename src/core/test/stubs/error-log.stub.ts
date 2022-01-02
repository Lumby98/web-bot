import { ErrorLogModel } from '../../models/logEntry/error-log.model';

let i = 0;
const errorMessage = 'TestErrorMessage';
export const errorLogStub = (): ErrorLogModel => {
  return {
    id: i++,
    errorMessage: errorMessage + 't',
    displayErrorMessage: undefined,
    logs: [],
  };
};
