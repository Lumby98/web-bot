export const puppeteerServiceInterfaceProvider =
  'puppeteerServiceInterfaceProvider';
export interface PuppeteerServiceInterface {
  startPuppeteer(url: string);
  stopPuppeteer();
  goToURL(url: string);
  getElementText(selector: string): Promise<string>;
  tryAgain(checkSelector: string, clickSelector: string, counter: number);
}
