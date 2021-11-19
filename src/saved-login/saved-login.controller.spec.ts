import { Test, TestingModule } from '@nestjs/testing';
import { SavedLoginController } from './saved-login.controller';

describe('SavedLoginController', () => {
  let controller: SavedLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedLoginController],
    }).compile();

    controller = module.get<SavedLoginController>(SavedLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
