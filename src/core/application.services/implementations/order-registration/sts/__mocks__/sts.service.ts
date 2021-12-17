import { stsOrderStub } from '../../../../../test/stubs/sts-order.stub';

export const StsService = jest.fn().mockReturnValue({
  handleSTSOrder: jest.fn().mockResolvedValue(stsOrderStub()),
  inputStsUsageEnvironment: jest.fn().mockResolvedValue(undefined),
  inputStsModel: jest.fn().mockResolvedValue(undefined),
  supplement: jest.fn().mockResolvedValue(undefined),
});
