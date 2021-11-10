export const hultaforsScraperInterfaceProvider =
  'hultaforsScraperInterfaceProvider';
export interface HultaforsScraperInterface {
  scrapeHultafors(username: string, password: string): Promise<any[]>;
}
