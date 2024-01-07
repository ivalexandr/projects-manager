import { Test, TestingModule } from '@nestjs/testing';
import { TeamChatMessageService } from './team-chat-message.service';

describe('TeamChatMessageService', () => {
  let service: TeamChatMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamChatMessageService],
    }).compile();

    service = module.get<TeamChatMessageService>(TeamChatMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
