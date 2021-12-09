import { stsOrderStub } from '../../../core/test/stubs/sts-order.stub';
import { TargetAndSelectorStub } from '../../../core/test/stubs/target-and-selector';
import { string } from '@hapi/joi';
import { OrderInfoModel } from '../../../core/models/order-info.model';
import { orderStub } from '../../../core/test/stubs/order-stub';

export const OrderPuppeteerService = jest.fn().mockReturnValue({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  navigateToURL: jest.fn().mockResolvedValue(undefined),
  loginOrtowear: jest.fn().mockResolvedValue(undefined),
  readOrder: jest.fn().mockResolvedValue(orderStub()),
  readType: jest.fn().mockResolvedValue('STS'),
  readSTSOrder: jest.fn().mockResolvedValue(stsOrderStub()),
  checkLocation: jest.fn().mockResolvedValue(true),
  getCurrentURL: jest.fn().mockReturnValue('https://www.google.com/'),
  readSelectorText: jest.fn().mockResolvedValue('testString'),
  getTableTargetandSelector: jest
    .fn()
    .mockResolvedValue(TargetAndSelectorStub()),
  wait: jest.fn().mockResolvedValue(undefined),
  click: jest.fn().mockResolvedValue(undefined),
  goToOrder: jest.fn().mockResolvedValue(undefined),
});
