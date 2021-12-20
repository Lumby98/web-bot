import { insOrderStub } from '../../../../../test/stubs/ins-s-order.stub';

export const InssService = jest.fn().mockReturnValue({
  handleINSSOrder: jest.fn().mockResolvedValue(insOrderStub()),
  inputInssUsageEnvironment: jest.fn().mockResolvedValue(undefined),
  inputInssModel: jest.fn().mockResolvedValue(undefined),
  orthotics: jest.fn().mockResolvedValue(undefined),
  confirmation: jest.fn().mockResolvedValue(undefined),
});
