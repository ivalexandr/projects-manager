import { Module } from '@nestjs/common';
import { TeamAccessService } from './services/team-access/team-access.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TeamAccess,
  teamAccessScheme,
} from '../../database/models/team_access';
import { TeamAccessResolver } from './resolvers/team-access.resolver';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamAccess.name, schema: teamAccessScheme },
    ]),
    AuthModule,
    UserModule,
  ],
  providers: [TeamAccessService, TeamAccessResolver],
  exports: [TeamAccessService],
})
export class TeamAccessModule {}
