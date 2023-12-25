import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Team } from '../../../../database/models/team';
import { TCreateTeam } from '../../../../types/team/create-team.type';
import mongoose, { Model } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ADD_USER_TO_TEAM_EVENT,
  CHECK_TEAM_EXISTENCE_EVENT,
  CREATE_PROJECT_EVENT,
  CREATE_TEAM_EVENT,
  TAddUserToTeamPayload,
  TCheckTeamExistencePayload,
  TCreateProjectPayload,
  TCreateTeamPayload,
} from '../../../../events/events';
import * as uuid from 'uuid';
import * as path from 'path';
import { writeFile } from 'fs/promises';
import { TeamStatus } from '../../../../database/enums/team-status.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TTeamPaginated } from '../../../../types/team/team-paginated';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  async create(createTeam: TCreateTeam) {
    try {
      const avatar = await this.convertAndSaveImage(createTeam.avatar);
      const banner = await this.convertAndSaveImage(createTeam.banner);

      const team = {
        name: createTeam.name,
        description: createTeam.description,
        avatar,
        banner,
        isPublic: createTeam.isPublic,
        leader: createTeam.leader,
        createdAt: new Date(Date.now()),
        members: [createTeam.leader],
      } as unknown as Team;

      const teamFromDb = await this.teamModel.create(team);

      await this.eventEmmiter.emitAsync(CREATE_TEAM_EVENT, {
        userId: createTeam.leader,
        teamId: teamFromDb.id,
      } as TCreateTeamPayload);

      return await this.teamModel
        .findById(teamFromDb._id)
        .populate(['members', 'leader', 'projects'])
        .exec();
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new BadRequestException('Team with this name already exist');
      }
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await this.teamModel
        .findById(id)
        .populate(['members', 'leader', 'projects'])
        .exec();
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async findAllTeamByUserId(userId: string) {
    try {
      const result = await this.teamModel
        .find({ members: userId })
        .populate(['members', 'leader', 'projects'])
        .exec();
      if (!result || result.length === 0) {
        throw new BadRequestException('No teams found for this user');
      }
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllActivePublicTeam(page: number, pageSize: number) {
    const cacheKey = `activePublicTeams:${page}:${pageSize}`;
    let result = await this.cacheManager.get<TTeamPaginated>(cacheKey);

    if (!result) {
      const condition = {
        isPublic: true,
        status: TeamStatus.ACTIVE,
      };
      const totalCount = await this.teamModel.countDocuments(condition);
      const items = await this.teamModel
        .find(condition)
        .populate(['members', 'leader', 'projects'])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
      result = { items, totalCount };
      await this.cacheManager.set(cacheKey, result);
    }
    return result;
  }

  private async convertAndSaveImage(base64?: string) {
    if (base64) {
      const fileName = `${uuid.v4()}.jpg`;
      const data = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(data, 'base64');

      const uploadPath = path.join(`${process.cwd()}/src`, 'uploads');

      await writeFile(path.join(uploadPath, fileName), buffer);
      return fileName;
    }
    return '';
  }

  @OnEvent(ADD_USER_TO_TEAM_EVENT, { async: true })
  private async addUserToTeamHandler({
    teamId,
    userId,
  }: TAddUserToTeamPayload) {
    try {
      await this.teamModel.findByIdAndUpdate(teamId, {
        $addToSet: { members: userId },
      });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  @OnEvent(CHECK_TEAM_EXISTENCE_EVENT, { async: true })
  private async checkTeamExistenceHandler({
    teamId,
  }: TCheckTeamExistencePayload) {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }
  }

  @OnEvent(CREATE_PROJECT_EVENT, { async: true })
  private async addProjectToTeamHandler({
    projectId,
    teamId,
  }: TCreateProjectPayload) {
    try {
      await this.teamModel.findByIdAndUpdate(teamId, {
        $addToSet: { projects: projectId },
      });
    } catch (error) {}
  }
}
