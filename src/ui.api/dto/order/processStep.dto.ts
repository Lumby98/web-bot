import { ProcessStepEnum } from '../../../core/enums/processStep.enum';

export class ProcessStepDto {
  processStep: ProcessStepEnum;
  errorMessage?: string;
  error: boolean;
}
