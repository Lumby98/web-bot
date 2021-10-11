import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { Repository } from 'typeorm';
import { User } from '../../../infrastructure/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'test',
        admin: 1,
      };
      jest.spyOn(repo, 'findOne').mockImplementationOnce(() => {
        return undefined;
      });
      jest.spyOn(repo, 'create').mockImplementationOnce(() => {
        return testUser;
      });
      jest.spyOn(repo, 'save').mockResolvedValueOnce(testUser);
      const expected = await service.create({
        username: testUser.username,
        password: testUser.password,
        admin: testUser.admin,
      });
      expect(expected).toEqual(testUser);
    });

    it('should throw an error it use could not be created', () => {
      jest.spyOn(repo, 'create').mockImplementationOnce(() => undefined);
      expect(async () => {
        await service.create({ username: 'test', password: 'test', admin: 1 });
      }).rejects.toThrow();
    });

    it("should throw error if 'admin' is incorrect", () => {
      expect(async () => {
        await service.create({ username: 'test', password: 'test', admin: 2 });
      }).rejects.toThrow();
    });
  });

  describe('getByUsername', () => {
    it('should get a user by their username', async () => {
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'test',
        admin: 0,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser);
      const expected = await service.getByUsername(testUser.username);
      expect(expected).toEqual(testUser);
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should throw an error if user does not exist', () => {
      const testUser = 'test';
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(undefined);
      expect(
        async () => await service.getByUsername(testUser),
      ).rejects.toThrow();
      expect(repo.findOne).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should get a user by their id', async () => {
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'test',
        admin: 0,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser);
      const expected = await service.getById(testUser.id);
      expect(expected).toEqual(testUser);
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should throw an error if user does not exist', () => {
      const testUser = 2;
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(undefined);
      expect(async () => await service.getById(testUser)).rejects.toThrow();
      expect(repo.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const testUserToUpdate: User = {
        id: 1,
        username: 'test',
        password: 'hello',
        admin: 0,
      };
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'test',
        admin: 1,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUserToUpdate);
      jest.spyOn(repo, 'update').mockImplementationOnce(async () => {
        return new UpdateResult();
      });
      testUserToUpdate.password = 'test';
      testUserToUpdate.admin = 1;
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser);
      expect(await service.update(testUser.username, testUser)).toEqual(
        testUser,
      );
    });

    it('should throw an error if user could not be updated', () => {
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'hello',
        admin: 1,
      };
      jest.spyOn(repo, 'update').mockResolvedValueOnce(undefined);
      expect(async () => {
        await service.update(testUser.username, testUser);
      }).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'hello',
        admin: 1,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser);
      jest.spyOn(repo, 'remove').mockResolvedValueOnce(testUser);
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(undefined);
      const expected = await service.remove(testUser.username);
      expect(expected).toEqual(true);
      expect(repo.remove).toHaveBeenCalled();
    });
    it('should throw error if user could not be removed', () => {
      const testUser: User = {
        id: 1,
        username: 'test',
        password: 'hello',
        admin: 1,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser);
      jest.spyOn(repo, 'remove').mockResolvedValueOnce(undefined);
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser);
      expect(async () => {
        await service.remove(testUser.username);
      }).rejects.toThrow();
    });
  });
});
