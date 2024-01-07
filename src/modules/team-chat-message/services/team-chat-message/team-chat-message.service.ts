import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TeamChatMessage } from '../../../../database/models/team-chat-message';
import mongoose, { Model } from 'mongoose';
import { TCreateTeamChatMessage } from '../../../../types/team-chat-message/create-team-chat-message.type';

@Injectable()
export class TeamChatMessageService {
  constructor(
    @InjectModel(TeamChatMessage.name)
    private readonly teamChatMessageModel: Model<TeamChatMessage>,
  ) {}

  async create(create: TCreateTeamChatMessage) {
    try {
      const messageFromDb = await this.teamChatMessageModel.create({
        message: create.message,
        sender: create.senderId,
        teamChat: create.chatId,
        createdAt: new Date(Date.now()),
      });
      return await messageFromDb.populate(['sender', 'teamChat']);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getMessageById(id: string) {
    try {
      return await this.teamChatMessageModel
        .findById(id)
        .populate(['sender', 'teamChat'])
        .exec();
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

  async getMessagesForChat(
    chatId: string,
    lastMessageId?: string,
    limit: number = 30,
  ) {
    try {
      const query = { teamChat: chatId };
      if (lastMessageId) {
        query['_id'] = { $lt: lastMessageId };
      }
      return await this.teamChatMessageModel
        .find(query)
        .sort({ _id: -1 })
        .limit(limit)
        .populate(['sender', 'teamChat'])
        .exec();
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid message ID format.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
