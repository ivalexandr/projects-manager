import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TeamAccess } from '../../../../database/models/team_access';
import mongoose, { Model } from 'mongoose';
import { TCreateTeamAccess } from '../../../../types/team-access/create-team-acess.type';
import { TSetRoleToUser } from '../../../../types/team-access/set-role-to-user.type';
import { TeamAccessStatus } from '../../../../database/enums/team-access-status';

@Injectable()
export class TeamAccessService {
  constructor(
    @InjectModel(TeamAccess.name)
    private readonly teamAccessModel: Model<TeamAccess>,
  ) {}

  async create(create: TCreateTeamAccess) {
    try {
      const teamAccess = await this.teamAccessModel.create({
        user: create.userId,
        team: create.teamId,
        status: create.teamAccessStatus,
        teamRole: create.teamRole,
      });

      return await teamAccess.populate(['team', 'user']);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async getTeamAccessesForUser(userId: string) {
    try {
      const teamAccesses = await this.teamAccessModel
        .find({
          user: userId,
          status: { $ne: TeamAccessStatus.DECLINED },
        })
        .populate(['team', 'user'])
        .exec();

      if (teamAccesses.length === 0) {
        throw new BadRequestException(`No teams for ${userId} user`);
      }
      return teamAccesses;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid ID format.');
      } else if (error instanceof BadRequestException) {
        throw new NotFoundException(`No teams for ${userId} user`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getTeamAccessForUser(userId: string, teamId: string) {
    try {
      return await this.teamAccessModel
        .findOne({ user: userId, team: teamId })
        .populate({ path: 'team', populate: ['leader', 'teamChat'] })
        .exec();
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid ID format.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getTeamAccessesForTeam(teamId: string) {
    try {
      return await this.teamAccessModel.find({ team: teamId }).populate('user');
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid team ID format.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async setRoleToUser(setRole: TSetRoleToUser) {
    try {
      return await this.teamAccessModel
        .findOneAndUpdate(
          {
            user: setRole.userId,
            team: setRole.teamId,
          },
          { teamRole: setRole.teamRole },
        )
        .populate('user')
        .exec();
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid ID format.');
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async inviteUserToTeam(create: TCreateTeamAccess) {
    const teamAccessExist = await this.teamAccessModel.findOne({
      team: create.teamId,
      user: create.userId,
    });

    if (teamAccessExist) {
      return await this.teamAccessModel
        .findByIdAndUpdate(
          teamAccessExist.id,
          {
            teamRole: create.teamRole,
            status: TeamAccessStatus.PENDING,
          },
          { new: true },
        )
        .populate('user')
        .exec();
    }

    const teamAccess = await this.create({
      userId: create.userId,
      teamId: create.teamId,
      teamRole: create.teamRole,
      teamAccessStatus: TeamAccessStatus.PENDING,
    });
    return teamAccess.populate('user');
  }

  async acceptingInvitation(answer: boolean, userId: string, teamId: string) {
    try {
      return await this.teamAccessModel.findOneAndUpdate(
        {
          user: userId,
          team: teamId,
        },
        {
          status: answer ? TeamAccessStatus.ACTIVE : TeamAccessStatus.DECLINED,
        },
        { new: true },
      );
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid ID format.');
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async removeTeamAccess(teamAccessId: string, username: string) {
    try {
      const teamAccess = await this.teamAccessModel
        .findById(teamAccessId)
        .populate({ path: 'team', populate: ['leader'] });

      if (!teamAccess) {
        throw new NotFoundException('Team access entry not found.');
      }

      if (teamAccess.team.leader.username !== username) {
        throw new ForbiddenException(
          'You do not have permission to delete this team access.',
        );
      }

      return await this.teamAccessModel
        .findByIdAndDelete(teamAccessId)
        .populate('user')
        .exec();
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid ID format.');
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error);
      } else if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
