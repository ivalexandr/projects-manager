import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, teamScheme } from '../../database/models/team';
import { TeamService } from './services/team/team.service';
import { TeamResolver } from './resolvers/team.resolver';
import { JwtService } from '../auth/services/jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: teamScheme, name: Team.name }]),
  ],
  providers: [JwtService, TeamResolver, TeamService],
  exports: [TeamService],
})
export class TeamModule {}
