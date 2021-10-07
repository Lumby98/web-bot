import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../../infrastructure/entities/site.entity';
import { SiteModel } from '../models/site.model';
import { SiteDto } from '../../api/dto/site/site.dto';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  /**
   * get all sites
   */
  async findSites(): Promise<SiteDto[]> {
    const sites = await this.siteRepository.find();
    return JSON.parse(JSON.stringify(sites));
  }

  /**
   * find one site
   * @param siteName
   */
  async findOneSite(siteName: string): Promise<SiteModel> {
    const site = this.siteRepository.findOne({ name: siteName });
    return JSON.parse(JSON.stringify(site));
  }

  /**
   * create site
   * @param newSite
   */
  async createSite(newSite: SiteModel): Promise<SiteModel> {
    const check = await this.siteRepository.findOne({ name: newSite.name });
    if (check) {
      console.log(check);
      throw new Error('cannot create site: site already exist');
    }
    const siteEntity = await this.siteRepository.create(newSite);
    await this.siteRepository.save(siteEntity);
    return JSON.parse(JSON.stringify(siteEntity));
  }

  /**
   * update site
   * @param site
   */
  async updateSite(site: SiteDto): Promise<SiteModel> {
    const siteToUpdate = await this.siteRepository.findOne({ name: site.name });
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
  }

  /**
   * remove a site
   * @param siteName
   */
  async removeSite(siteName: string) {
    const siteRemove = await this.siteRepository.findOne({ name: siteName });
    if (!siteRemove) {
      throw new Error('site does not exist');
    }

    const removed = await this.siteRepository.remove(siteRemove);
    return JSON.parse(JSON.stringify(removed));
  }

  /**
   * update site and return list of all sites
   * @param siteName
   */
  async updateSiteAfterScrape(siteName: string): Promise<SiteDto[]> {
    const check = await this.siteRepository.findOne(siteName);
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
  }
}
