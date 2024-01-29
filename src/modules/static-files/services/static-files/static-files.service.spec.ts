import { Test, TestingModule } from '@nestjs/testing';
import { StaticFilesService } from './static-files.service';

describe('StaticFilesService', () => {
  let service: StaticFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaticFilesService],
    }).compile();

    service = module.get<StaticFilesService>(StaticFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
