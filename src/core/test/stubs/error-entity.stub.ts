import { ErrorEntity } from '../../../infrastructure/entities/error.entity';

let i = 0;
const errorMessage = 'TestErrorMessage';
export const errorEntityStub = (): ErrorEntity => {
  return {
    id: i++,
    errorMessage: errorMessage + 't',
    displayErrorMessage: undefined,
    logs: [],
  };
};
