import { TargetAndSelector } from '../../models/target-and-selector';

export const TargetAndSelectorStub = (): TargetAndSelector => {
  return {
    target: '64589',
    selector: `#orders-table > tbody > tr:nth-child(1) > td:nth-child(6) > pre`,
    type: 'STS',
  };
};
