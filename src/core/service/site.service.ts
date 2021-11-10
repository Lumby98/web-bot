import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../../infrastructure/entities/site.entity';
import { SiteModel } from '../models/site.model';
import { SiteDto } from '../../ui.api/dto/site/site.dto';
import { SiteInterface } from '../interfaces/site.interface';

@Injectable()
export class SiteService implements SiteInterface {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  /**
   * get all sites
   */
  async findSites(): Promise<SiteDto[]> {
    try {
      const sites = await this.siteRepository.find();
      return JSON.parse(JSON.stringify(sites));
    } catch (err) {
      throw new Error('could not find sites');
    }
  }

  /**
   * find one site
   * @param siteName
   */
  async findOneSite(siteName: string): Promise<SiteModel> {
    try {
      const site = await this.siteRepository.findOne({ name: siteName });
      if (site) {
        return JSON.parse(JSON.stringify(site));
      }
    } catch (err) {
      throw new Error('could not find site');
    }
  }

  /**
   * create site
   * @param newSite
   */
  async createSite(newSite: SiteModel): Promise<SiteModel> {
    try {
      const check = await this.siteRepository.findOne({ name: newSite.name });
      if (check) {
        console.log(check);
        throw new Error('site already exist');
      }
      const siteEntity = await this.siteRepository.create(newSite);
      await this.siteRepository.save(siteEntity);
      return JSON.parse(JSON.stringify(siteEntity));
    } catch (err) {
      if (err.message == 'site already exist') {
        throw err;
      } else {
        throw new Error('failed to create site');
      }
    }
  }

  /**
   * update site
   * @param site
   */
  async updateSite(site: SiteDto): Promise<SiteModel> {
    try {
      const siteToUpdate = await this.siteRepository.findOne({
        name: site.name,
      });
      if (!siteToUpdate) {
        throw new Error('Site does not exist');
      }

      await this.siteRepository.save({ name: siteToUpdate.name, ...site });
      const uSite = await this.siteRepository.findOne({
        name: siteToUpdate.name,
      });

      if (!uSite) {
        throw new Error('failed to update site');
      }
      return JSON.parse(JSON.stringify(uSite));
    } catch (err) {
      if (err.message == 'Site does not exist') {
        throw err;
      } else if (err.message == 'failed to update site') {
        throw err;
      } else {
        throw new Error('failed to update site');
      }
    }
  }

  /**
   * remove a site
   * @param siteName
   */
  async removeSite(siteName: string) {
    try {
      const siteRemove = await this.siteRepository.findOne({ name: siteName });
      if (!siteRemove) {
        throw new Error('site does not exist');
      }

      const removed = await this.siteRepository.remove(siteRemove);

      const deletedSite = await this.siteRepository.findOne({ name: siteName });
      if (!deletedSite) {
        return JSON.parse(JSON.stringify(removed));
      } else {
        throw new Error();
      }
    } catch (err) {
      if (err.message == 'site does not exist') {
        throw err;
      } else {
        throw new Error('failed to remove site');
      }
    }
  }

  /**
   * update site and return list of all sites
   * @param siteName
   */
  async updateSiteAfterScrape(siteName: string): Promise<SiteDto[]> {
    try {
      const check = await this.findOneSite(siteName);
      if (!check) {
        await this.createSite({
          name: siteName,
          lastScraped: new Date().toLocaleDateString(),
        });
      } else {
        console.log(check);
        check.lastScraped = new Date().toLocaleDateString();
        await this.updateSite(check);
      }
      const sites = await this.findSites();
      return JSON.parse(JSON.stringify(sites));
    } catch (err) {
      throw err;
    }
  }
}
