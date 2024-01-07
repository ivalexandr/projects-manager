import { Module } from '@nestjs/common';
import { TeamChatService } from './services/team-chat/team-chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamChat, teamChatScheme } from '../../database/models/team-chat';
import { TeamChatGateway } from './gateways/team-chat/team-chat.gateway';
import { JwtService } from '../auth/services/jwt/jwt.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard/ws-jwt.guard';
import { TeamChatMessageModule } from '../team-chat-message/team-chat-message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: teamChatScheme, name: TeamChat.name },
    ]),
    TeamChatMessageModule,
  ],
  providers: [TeamChatService, TeamChatGateway, JwtService, WsJwtGuard],
  exports: [TeamChatService, TeamChatGateway],
})
export class TeamChatModule {}
