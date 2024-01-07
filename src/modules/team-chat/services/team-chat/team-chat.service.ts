import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TeamChat } from '../../../../database/models/team-chat';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class TeamChatService {
  constructor(
    @InjectModel(TeamChat.name) private readonly teamChatModel: Model<TeamChat>,
  ) {}

  async create(teamId: string) {
    try {
      return await this.teamChatModel.create({
        team: teamId,
        createdAt: new Date(Date.now()),
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getChatById(chatId: string) {
    try {
      return await this.teamChatModel.findById(chatId).populate('team').exec();
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid message ID format.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async addMessageToChat(chatid: string, messageId: string) {
    try {
      return await this.teamChatModel.findByIdAndUpdate(
        chatid,
        {
          messages: [messageId],
        },
        { new: true },
      );
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid message ID format.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
