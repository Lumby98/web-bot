import { SiteDto } from '../../ui.api/dto/site/site.dto';
import { SiteModel } from '../models/site.model';

export const siteInterfaceProvider = 'siteInterfaceProvider';
export interface SiteInterface {
  findSites(): Promise<SiteDto[]>;

  findOneSite(siteName: string): Promise<SiteModel>;

  createSite(newSite: SiteModel): Promise<SiteModel>;

  updateSite(site: SiteDto): Promise<SiteModel>;

  removeSite(siteName: string);

  updateSiteAfterScrape(siteName: string): Promise<SiteDto[]>;
}
