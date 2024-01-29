import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, teamScheme } from '../../database/models/team';
import { TeamService } from './services/team/team.service';
import { TeamResolver } from './resolvers/team.resolver';
import { JwtService } from '../auth/services/jwt/jwt.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TeamChatModule } from '../team-chat/team-chat.module';
import { StaticFilesModule } from '../static-files/static-files.module';
import { TeamAccessModule } from '../team-access/team-access.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: teamScheme, name: Team.name }]),
    CacheModule.register({
      ttl: 300000,
      max: 150,
    }),
    TeamChatModule,
    StaticFilesModule,
    TeamAccessModule,
    UserModule,
  ],
  providers: [JwtService, TeamResolver, TeamService],
  exports: [TeamService],
})
export class TeamModule {}
