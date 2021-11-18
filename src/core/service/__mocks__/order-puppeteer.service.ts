export const OrderPuppeteerService = jest.fn().mockReturnValue({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  navigateToURL: jest.fn().mockResolvedValue(undefined),
  loginOrtowear: jest.fn().mockResolvedValue(undefined),
});
