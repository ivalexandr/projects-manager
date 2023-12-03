import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { MockProxy, mock } from 'jest-mock-extended';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Team, TeamDocument } from '../../../../database/models/team';
import { Model } from 'mongoose';

describe('TeamService', () => {
  let service: TeamService;
  let eventEmitter: MockProxy<EventEmitter2>;
  let teamModel: MockProxy<Model<TeamDocument>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: EventEmitter2, useValue: mock<EventEmitter2>() },
        {
          provide: getModelToken(Team.name),
          useValue: mock<Model<TeamDocument>>(),
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    eventEmitter = module.get<MockProxy<EventEmitter2>>(EventEmitter2);
    teamModel = module.get<MockProxy<Model<TeamDocument>>>(
      getModelToken(Team.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(eventEmitter).toBeDefined();
    expect(teamModel).toBeDefined();
  });
});
