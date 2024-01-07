import { Test, TestingModule } from '@nestjs/testing';
import { TeamChatService } from './team-chat.service';

describe('TeamChatService', () => {
  let service: TeamChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamChatService],
    }).compile();

    service = module.get<TeamChatService>(TeamChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
