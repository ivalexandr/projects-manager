import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '../../../auth/services/jwt/jwt.service';
import { CreateUserDto } from '../../../../database/dto/create-user-dto';
import { User } from '../../../../database/models/user';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as uuid from 'uuid';
import {
  ADD_USER_TO_TEAM_EVENT,
  CREATE_TEAM_EVENT,
  TAddUserToTeamPayload,
  TCreateTeamPayload,
} from '../../../../events/events';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateUserDto) {
    try {
      const createdUser = {
        email: data.email,
        password: data.password,
        refreshToken: this.jwtService.createRefreshToken(),
        createdAt: new Date(Date.now()),
        username: uuid.v4(),
      } as User;

      const createUser = await this.userModel.create(createdUser);

      return createUser;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async findUserByUsername(username: string) {
    try {
      return await this.userModel.findOne({ username });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async getUser(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async findById(id: string) {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async addUserForTeam(userId: string, teamId: string) {
    try {
      await this.eventEmitter.emitAsync(ADD_USER_TO_TEAM_EVENT, {
        userId,
        teamId,
      } as TAddUserToTeamPayload);

      return await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { teams: teamId },
      });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async getUsersWithTeam(teamId: string) {
    try {
      return await this.userModel.find({
        teams: { $in: [teamId] },
      });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async updateRefreshToken(userId: string) {
    const updatedUser = await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: this.jwtService.createRefreshToken() } },
    );

    if (updatedUser.modifiedCount === 0) {
      throw new NotFoundException(
        `User with ID ${userId} not found or name was not modified`,
      );
    }

    return await this.userModel.findById(userId);
  }

  @OnEvent(CREATE_TEAM_EVENT)
  private async addLeaderOnTeamHandler(payload: TCreateTeamPayload) {
    const { userId, teamId } = payload;

    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { teams: teamId },
      });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }
}
