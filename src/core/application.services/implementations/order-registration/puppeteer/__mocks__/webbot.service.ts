export const WebbotService = jest.fn().mockReturnValue({
  startPuppeteer: jest.fn().mockResolvedValue(undefined),
  stopPuppeteer: jest.fn().mockResolvedValue(undefined),
  goToURL: jest.fn().mockResolvedValue(undefined),
  getElementText: jest.fn().mockResolvedValue('test'),
  tryAgain: jest.fn().mockResolvedValue(undefined),
});
