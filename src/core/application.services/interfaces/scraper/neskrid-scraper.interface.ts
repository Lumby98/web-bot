import { NeskridModel } from '../../../models/neskrid.model';

export const neskridScraperInterfaceProvider =
  'neskridScraperInterfaceProvider';
export interface NeskridScraperInterface {
  scrapNeskrid(username: string, password: string): Promise<NeskridModel[]>;

  updateAfterScrape(products: NeskridModel[]): Promise<NeskridModel[]>;
}
