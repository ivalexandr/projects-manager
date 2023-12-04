import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { MockProxy, mock } from 'jest-mock-extended';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Team, TeamDocument } from '../../../../database/models/team';
import mongoose, { Model } from 'mongoose';
import { TCreateTeam } from '../../../../types/team/create-team.type';
import mockdate from 'mockdate';
import { BadRequestException } from '@nestjs/common';

describe('TeamService', () => {
  let service: TeamService;
  let eventEmitter: MockProxy<EventEmitter2>;
  let teamModel: MockProxy<Model<TeamDocument>>;

  const createTeam: TCreateTeam = {
    name: 'Fake Team',
    description: 'Fake description',
    leader: '1234',
    avatar: 'Fake Avatar',
    banner: 'Fake banner',
    isPublic: true,
  };

  const mockCreateDate = new Date(Date.now());

  const fakeTeam: Team = {
    name: createTeam.name,
    description: createTeam.description,
    leader: createTeam.leader as any,
    avatar: createTeam.avatar,
    isPublic: createTeam.isPublic,
    banner: createTeam.banner,
    createdAt: mockCreateDate,
  } as Team;

  const fakeTeamFromDb = {
    id: '123',
    name: fakeTeam.name,
    description: fakeTeam.description,
    leader: fakeTeam.leader,
    avatar: fakeTeam.avatar,
    isPublic: fakeTeam.isPublic,
    banner: fakeTeam.banner,
    createdAt: mockCreateDate,
  } as TeamDocument;

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

  afterEach(() => {
    mockdate.reset();
  });

  describe('create', () => {
    it('should create a new team and return one', async () => {
      mockdate.set(mockCreateDate);
      teamModel.create.mockResolvedValue(fakeTeamFromDb as any);
      teamModel.findByIdAndUpdate.mockResolvedValue(fakeTeamFromDb);
      eventEmitter.emitAsync.mockReturnThis();

      const result = await service.create(createTeam);
      expect(result).toEqual(fakeTeamFromDb);
      expect(teamModel.create).toHaveBeenCalledWith(fakeTeam);
      expect(teamModel.findByIdAndUpdate).toHaveBeenCalledWith(
        fakeTeamFromDb.id,
        {
          $push: { members: createTeam.leader },
        },
      );
      expect(eventEmitter.emitAsync).toBeCalledTimes(1);
    });

    it('should throw BadRequestException when ValidationError', async () => {
      const error = new mongoose.Error.ValidationError();
      const errorMessage = error.message;

      teamModel.create.mockRejectedValue(error);

      try {
        await service.create(createTeam);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('findById', () => {
    it('should find team by id and return one', async () => {
      teamModel.findById.mockResolvedValue(fakeTeamFromDb);

      const result = await service.findById(fakeTeamFromDb.id);

      expect(result).toEqual(fakeTeamFromDb);
      expect(teamModel.findById).toHaveBeenCalledWith(fakeTeamFromDb.id);
    });

    it('shoud throw BadRequestException when DocumentNotFoundError', async () => {
      const error = new mongoose.Error.DocumentNotFoundError('no found');
      const errorMessage = error.message;
      teamModel.findById.mockRejectedValue(error);

      try {
        await service.findById(fakeTeamFromDb.id);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(errorMessage);
      }
    });
  });
});
