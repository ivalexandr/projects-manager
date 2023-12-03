import { Module } from '@nestjs/common';
import { ProjectService } from './services/project/project.service';
import { ProjectResolver } from './resolvers/project.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, projectScheme } from '../../database/models/project';

import { JwtGraphqlGuard } from '../auth/guards/jwt-graphql/jwt-graphql.guard';
import { JwtService } from '../auth/services/jwt/jwt.service';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    TeamModule,
    MongooseModule.forFeature([{ schema: projectScheme, name: Project.name }]),
  ],
  providers: [JwtService, JwtGraphqlGuard, ProjectResolver, ProjectService],
})
export class ProjectModule {}
