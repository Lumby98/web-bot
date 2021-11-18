import { StsOrderStub } from '../../test/stubs/sts-order.stub';

export const OrderPuppeteerService = jest.fn().mockReturnValue({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  navigateToURL: jest.fn().mockResolvedValue(undefined),
  loginOrtowear: jest.fn().mockResolvedValue(undefined),
  getOrderType: jest.fn().mockResolvedValue('STS'),
  checkCover: jest.fn().mockResolvedValue(true),
  readSTSOrder: jest.fn().mockResolvedValue(StsOrderStub()),
});
