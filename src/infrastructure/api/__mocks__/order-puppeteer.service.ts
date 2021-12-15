import { stsOrderStub } from '../../../core/test/stubs/sts-order.stub';
import { TargetAndSelectorStub } from '../../../core/test/stubs/target-and-selector';
import { orderStub } from '../../../core/test/stubs/order-stub';
import { insOrderStub } from '../../../core/test/stubs/ins-s-order.stub';

export const OrderPuppeteerService = jest.fn().mockReturnValue({
  start: jest.fn().mockResolvedValue(undefined),
  navigateToURL: jest.fn().mockResolvedValue(undefined),
  loginOrtowear: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  readSTSOrder: jest.fn().mockResolvedValue(stsOrderStub()),
  readINSSOrder: jest.fn().mockResolvedValue(insOrderStub()),
  readOrder: jest.fn().mockResolvedValue(orderStub()),
  checkLocation: jest.fn().mockResolvedValue(true),
  readType: jest.fn().mockResolvedValue('STS'),
  getCurrentURL: jest.fn().mockReturnValue('https://www.google.com/'),
  getCSSofElement: jest.fn().mockResolvedValue('CSSOfElement'),
  readSelectorText: jest.fn().mockResolvedValue('testString'),
  wait: jest.fn().mockResolvedValue(undefined),
  loginNeskrid: jest.fn().mockResolvedValue(undefined),
  input: jest.fn().mockResolvedValue(undefined),
  press: jest.fn().mockResolvedValue(undefined),
  click: jest.fn().mockResolvedValue(undefined),
  dropdownSelect: jest.fn().mockResolvedValue(undefined),
  selectByTexts: jest.fn().mockResolvedValue(undefined),
  getTextsForAll: jest.fn().mockResolvedValue([]),
  getInputValue: jest.fn().mockResolvedValue(undefined),
  getTableTargetandSelector: jest
    .fn()
    .mockResolvedValue(TargetAndSelectorStub()),
  goToOrder: jest.fn().mockResolvedValue(undefined),
  clickRadioButton: jest.fn().mockResolvedValue(undefined),
});
