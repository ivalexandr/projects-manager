import { Module } from '@nestjs/common';
import { TeamChatMessageService } from './services/team-chat-message/team-chat-message.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TeamChatMessage,
  teamChatMessageScheme,
} from '../../database/models/team-chat-message';
import { TeamChatMessageResolver } from './resolvers/team-chat-message.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: teamChatMessageScheme, name: TeamChatMessage.name },
    ]),
  ],
  providers: [TeamChatMessageService, TeamChatMessageResolver],
  exports: [TeamChatMessageService],
})
export class TeamChatMessageModule {}
