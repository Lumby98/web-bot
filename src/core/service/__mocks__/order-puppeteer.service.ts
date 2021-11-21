import { StsOrderStub } from '../../test/stubs/sts-order.stub';

export const OrderPuppeteerService = jest.fn().mockReturnValue({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  navigateToURL: jest.fn().mockResolvedValue(undefined),
  loginOrtowear: jest.fn().mockResolvedValue(undefined),
  readType: jest.fn().mockResolvedValue('STS'),
  readSTSOrder: jest.fn().mockResolvedValue(StsOrderStub()),
  checkLocation: jest.fn().mockResolvedValue(true),
  getCurrentURL: jest.fn().mockResolvedValue('https://www.google.com/'),
  readSelectorText: jest.fn().mockResolvedValue('testString'),
});
