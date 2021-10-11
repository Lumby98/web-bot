import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from '../site.service';
import { Repository, UpdateResult } from 'typeorm';
import { Site } from '../../../infrastructure/entities/site.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SiteService', () => {
  let service: SiteService;
  let repo: Repository<Site>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: getRepositoryToken(Site),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
    repo = module.get(getRepositoryToken(Site));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all sites', async () => {
      const testSites: Site[] = [
        { name: 'test', lastScraped: new Date().toLocaleDateString() },
        { name: 'test2', lastScraped: new Date().toLocaleDateString() },
      ];
      jest.spyOn(repo, 'find').mockResolvedValueOnce(testSites);
      const expected = await service.findSites();
      expect(expected).toEqual(testSites);
    });

    it('should throw error', () => {
      jest.spyOn(repo, 'find').mockImplementationOnce(() => {
        throw Error('test error');
      });
      expect(async () => {
        await service.findSites();
      }).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should find one site', async () => {
      const testSite: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSite);
      const expected = await service.findOneSite(testSite.name);
      expect(expected).toEqual(testSite);
      expect(repo.findOne).toHaveBeenCalled();
    });
    it('should throw error when no user is found', () => {
      jest.spyOn(repo, 'findOne').mockImplementationOnce(() => {
        throw new Error('test error');
      });
      expect(async () => {
        await service.findOneSite('test');
      }).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create site', async () => {
      const testSite: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };
      jest.spyOn(repo, 'findOne').mockImplementationOnce(() => {
        return undefined;
      });
      jest.spyOn(repo, 'create').mockImplementationOnce(() => {
        return testSite;
      });
      jest.spyOn(repo, 'save').mockResolvedValueOnce(testSite);

      const expected = await service.createSite({
        name: testSite.name,
        lastScraped: testSite.lastScraped,
      });

      expect(expected).toEqual(testSite);
    });

    it('should throw error if site exist', () => {
      const site: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };

      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(site);
      expect(async () => {
        await service.createSite(site);
      }).rejects.toThrow();
    });

    it('should throw error if site could not be created', () => {
      jest.spyOn(repo, 'findOne').mockImplementationOnce(() => {
        return undefined;
      });
      jest.spyOn(repo, 'create').mockImplementationOnce(() => undefined);
      jest.spyOn(repo, 'save').mockImplementationOnce(() => undefined);

      expect(async () => {
        await service.createSite({
          name: 'test',
          lastScraped: new Date().toLocaleDateString(),
        });
      }).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a site', async () => {
      const testSiteToUpdate: Site = {
        name: 'test',
        lastScraped: '123',
      };
      const testSite: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };

      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSiteToUpdate);
      jest.spyOn(repo, 'save').mockResolvedValueOnce(testSite);

      testSiteToUpdate.lastScraped = testSite.lastScraped;

      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSite);

      expect(await service.updateSite(testSiteToUpdate)).toEqual(testSite);
    });

    it('should throw error if site does not exist', () => {
      jest.spyOn(repo, 'findOne').mockImplementationOnce(() => undefined);
      expect(
        async () =>
          await service.updateSite({ name: 'test', lastScraped: 'test' }),
      ).rejects.toThrow();
    });

    it('should throw error is site is not updated', () => {
      const testSiteToUpdate: Site = {
        name: 'test',
        lastScraped: '123',
      };
      const testSite: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };

      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSiteToUpdate);
      jest.spyOn(repo, 'update').mockImplementationOnce(() => {
        throw new Error('test error');
      });

      testSiteToUpdate.lastScraped = testSite.lastScraped;

      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSite);

      expect(
        async () => await service.updateSite(testSiteToUpdate),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove site', async () => {
      const testSite: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSite);
      jest.spyOn(repo, 'remove').mockResolvedValueOnce(testSite);
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(undefined);
      const expected = await service.removeSite(testSite.name);
      expect(expected).toEqual(testSite);
      expect(repo.remove).toHaveBeenCalled();
    });

    it('should throw error if site does not exist', () => {
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(undefined);
      expect(async () => await service.removeSite('test')).rejects.toThrow();
    });

    it('should throw eror if site is not deleted', () => {
      const testSite: Site = {
        name: 'test',
        lastScraped: new Date().toLocaleDateString(),
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSite);
      jest.spyOn(repo, 'remove').mockResolvedValueOnce(undefined);
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testSite);
      expect(async () => {
        await service.removeSite(testSite.name);
      }).rejects.toThrow();
    });
  });
});
