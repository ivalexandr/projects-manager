import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Team } from '../../../../database/models/team';
import { TCreateTeam } from '../../../../types/team/create-team.type';
import mongoose, { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CHECK_TEAM_EXISTENCE_EVENT,
  CREATE_PROJECT_EVENT,
  TCheckTeamExistencePayload,
  TCreateProjectPayload,
} from '../../../../events/events';
import { TeamStatus } from '../../../../database/enums/team-status.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TTeamPaginated } from '../../../../types/team/team-paginated';
import { TeamChatService } from '../../../team-chat/services/team-chat/team-chat.service';
import { StaticFilesService } from '../../../static-files/services/static-files/static-files.service';
import { TeamAccessService } from '../../../team-access/services/team-access/team-access.service';
import { TeamAccessStatus } from '../../../../database/enums/team-access-status';
import { TeamRole } from '../../../../database/enums/team-role.enum';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly teamChatService: TeamChatService,
    private readonly staticFileService: StaticFilesService,
    private readonly teamAccessService: TeamAccessService,
  ) {}

  async create(createTeam: TCreateTeam) {
    try {
      const avatar = await this.staticFileService.convertAndSaveImage(
        createTeam.avatar,
      );
      const banner = await this.staticFileService.convertAndSaveImage(
        createTeam.banner,
      );

      const teamFromDb = await this.teamModel.create({
        name: createTeam.name,
        description: createTeam.description,
        avatar,
        banner,
        isPublic: createTeam.isPublic,
        leader: createTeam.leader,
        createdAt: new Date(Date.now()),
        members: [createTeam.leader],
      });

      const teamAccessFromDb = await this.teamAccessService.create({
        userId: createTeam.leader,
        teamId: teamFromDb.id,
        teamAccessStatus: TeamAccessStatus.ACTIVE,
        teamRole: TeamRole.LEADER,
      });

      const chat = await this.teamChatService.create(teamFromDb._id.toString());
      await this.teamModel.findByIdAndUpdate(
        teamFromDb._id,
        { teamChat: chat },
        { new: true },
      );

      return teamAccessFromDb;
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
      return await this.teamModel.findById(id);
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid message ID format.');
      } else {
        throw new InternalServerErrorException();
      }
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
        .populate(['leader', 'projects'])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
      result = { items, totalCount };
      await this.cacheManager.set(cacheKey, result);
    }
    return result;
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
