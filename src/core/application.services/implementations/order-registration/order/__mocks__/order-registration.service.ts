import { OrderTypeEnum } from '../../../../../enums/type.enum';
import { DateStringStub } from '../../../../../test/stubs/date-string.stub';
import { TargetAndSelectorStub } from '../../../../../test/stubs/target-and-selector';

export const OrderRegistrationService = jest.fn().mockReturnValue({
  handleOrtowearNavigation: jest.fn().mockResolvedValue(undefined),
  getOrderType: jest.fn().mockResolvedValue(OrderTypeEnum.STS),
  checkForInsole: jest.fn().mockResolvedValue(true),
  handleNeskridNavigation: jest.fn().mockResolvedValue(undefined),
  loginValidation: jest.fn().mockReturnValue(true),
  inputOrderInformation: jest.fn().mockResolvedValue(undefined),
  inputAddress: jest.fn().mockResolvedValue(undefined),
  handleOrderCompletion: jest.fn().mockResolvedValue(DateStringStub()),
  formatDeliveryDate: jest.fn().mockReturnValue(new Date()),
  adjustYear: jest.fn().mockResolvedValue(true),
  adjustMonth: jest.fn().mockResolvedValue(true),
  getNextDayOfWeek: jest.fn().mockReturnValue(new Date()),
  getMonthFromString: jest.fn().mockReturnValue(5),
  getTableInfo: jest.fn().mockResolvedValue(TargetAndSelectorStub()),
});
