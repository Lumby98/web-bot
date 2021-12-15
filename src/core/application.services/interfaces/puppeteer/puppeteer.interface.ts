export const puppeteerInterfaceProvider = 'puppeteerInterfaceProvider';
export interface PuppeteerInterface {
  startPuppeteer(url: string);
  stopPuppeteer();
  goToURL(url: string);
  getElementText(selector: string): Promise<string>;
  tryAgain(checkSelector: string, clickSelector: string, counter: number);
}
